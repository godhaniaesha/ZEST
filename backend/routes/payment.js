const express = require("express");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const Reservation = require("../models/Reservation");
const Order = require("../models/Order");
const Table = require("../models/Table");
const { auth } = require("../middleware/auth");

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET);
const ADVANCE_AMOUNT = Reservation.ADVANCE_AMOUNT || 200;

const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return next();

  const jwt = require("jsonwebtoken");
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key-change-in-production"
    );
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
};

const createPaymentIntent = async (amount, paymentMethod) => {
  if (!["Card", "UPI"].includes(paymentMethod)) {
    throw new Error("Payment method must be Card or UPI.");
  }

  const paymentIntentConfig = {
    amount: Math.round(amount * 100),
    currency: "inr",
    payment_method_types: paymentMethod === "UPI" ? ["upi"] : ["card"],
  };

  return stripe.paymentIntents.create(paymentIntentConfig);
};

const tableDisplayId = (tableDoc) => {
  if (!tableDoc) return null;
  if (tableDoc.displayId) return tableDoc.displayId;
  const prefix = tableDoc.type === "Bar" ? "B" : "C";
  return `${prefix}-${String(tableDoc.number).padStart(2, "0")}`;
};

const tableMatchVariants = (label) => {
  if (!label) return [];
  const raw = String(label).trim();
  const normalized = raw.replace(/^Table\s*/i, "").trim();
  const variants = new Set([raw, normalized, `Table ${normalized}`]);
  const match = normalized.match(/^([BC])-(\d+)$/i);
  if (match) {
    variants.add(
      `${match[1].toUpperCase()}-${String(match[2]).padStart(2, "0")}`,
    );
  }
  return [...variants];
};

const resolveBillOrderIds = async ({ reservationId, orderIds, tableLabel }) => {
  const ids = new Set(
    (Array.isArray(orderIds) ? orderIds : [])
      .filter(Boolean)
      .map((id) => String(id)),
  );

  const reservation = await Reservation.findById(reservationId).populate("table");
  if (!reservation) {
    return [...ids];
  }

  const unpaidFilter = { status: { $nin: ["Paid", "Cancelled"] } };

  const byReservation = await Order.find({
    reservationId: reservation._id,
    ...unpaidFilter,
  });
  byReservation.forEach((o) => ids.add(String(o._id)));

  const label = tableLabel || tableDisplayId(reservation.table);
  if (label) {
    const variants = tableMatchVariants(label);
    const byTable = await Order.find({
      table: { $in: variants },
      ...unpaidFilter,
    });
    byTable.forEach((o) => ids.add(String(o._id)));
  }

  return [...ids];
};

const finalizeBillSettlement = async ({
  reservationId,
  orderIds,
  tableLabel,
}) => {
  const reservation = await Reservation.findById(reservationId).populate("table");
  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  const allOrderIds = await resolveBillOrderIds({
    reservationId,
    orderIds,
    tableLabel,
  });

  if (allOrderIds.length) {
    await Order.updateMany(
      { _id: { $in: allOrderIds } },
      { $set: { status: "Paid", reservationId: reservation._id } },
    );
  }

  await Reservation.findByIdAndUpdate(reservationId, {
    fullPaymentDone: true,
    status: "Completed",
  });

  const tableRef = reservation.table?._id || reservation.table;
  if (tableRef) {
    await Table.findByIdAndUpdate(tableRef, { status: "Free" });
  }

  return {
    updatedOrderCount: allOrderIds.length,
    primaryOrderId: allOrderIds[0] || null,
    tableRef,
  };
};

const verifyPaymentIntent = async (paymentIntentId, expectedAmount) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment has not been completed. Please try again.");
  }

  if (expectedAmount != null && paymentIntent.amount !== Math.round(expectedAmount * 100)) {
    throw new Error("Payment amount does not match the expected total.");
  }

  return paymentIntent;
};

router.get("/config", (req, res) => {
  console.log("SECRET:", process.env.STRIPE_SECRET);
  console.log("PUBLISHABLE:", process.env.STRIPE_PUBLISHABLE_KEY);

  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    advanceAmount: 200,
  });
});
router.post("/reservation-advance-intent", async (req, res) => {
  try {
    const paymentIntent = await createPaymentIntent(
      ADVANCE_AMOUNT,
      req.body.paymentMethod
    );

    console.log("PI CREATED:", paymentIntent.id);
    console.log("CLIENT SECRET:", paymentIntent.client_secret);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.post("/reservation-advance-complete", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent ID is required." });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        message: "Payment has not been completed. Please complete the payment first.",
        paymentStatus: paymentIntent.status,
      });
    }

    if (paymentIntent.amount !== ADVANCE_AMOUNT * 100) {
      return res.status(400).json({
        message: `Invalid advance payment amount. Expected ₹${ADVANCE_AMOUNT}.`,
      });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        paymentType: "Advance",
        status: "Succeeded",
        amount: ADVANCE_AMOUNT,
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: ADVANCE_AMOUNT,
      message: "Advance payment verified successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Complete advance payment without Stripe (for UPI/Cash in admin)
router.post("/reservation-advance-complete-direct", auth, async (req, res) => {
  try {
    const { paymentMethod, upiVpa } = req.body;

    if (paymentMethod !== "UPI") {
      return res.status(400).json({ message: "This endpoint is for UPI payments only." });
    }

    if (!upiVpa) {
      return res.status(400).json({ message: "UPI VPA is required." });
    }

    // Create payment record directly without Stripe
    const payment = await Payment.create({
      paymentType: "Advance",
      paymentMethod: "UPI",
      status: "Succeeded",
      amount: ADVANCE_AMOUNT,
    });

    res.json({
      success: true,
      paymentIntentId: payment._id,
      amount: ADVANCE_AMOUNT,
      message: "Advance payment completed successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.post("/bill-intent", auth, async (req, res) => {
  try {
    const { reservationId, subtotal, tax, paymentMethod } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation is required." });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const grossTotal = (subtotal || 0) + (tax || 0);
    const advanceDeducted = reservation.advancePaid || 0;
    const finalAmount = Math.max(0, grossTotal - advanceDeducted);

    if (finalAmount <= 0) {
      return res.json({
        noPaymentRequired: true,
        finalAmount: 0,
        advanceDeducted,
        grossTotal,
      });
    }

    const paymentIntent = await createPaymentIntent(finalAmount, paymentMethod);

    await Payment.create({
      reservationId,
      amount: finalAmount,
      advanceDeducted,
      paymentMethod,
      stripePaymentIntentId: paymentIntent.id,
      paymentType: "Bill",
      status: "Pending",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      finalAmount,
      advanceDeducted,
      grossTotal,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/bill/complete", auth, async (req, res) => {
  try {
    const {
      reservationId,
      orderIds,
      paymentIntentId,
      subtotal,
      tax,
      paymentMethod,
      tableLabel,
    } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: "Reservation is required." });
    }

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." });
    }

    const grossTotal = (subtotal || 0) + (tax || 0);
    const advanceDeducted = reservation.advancePaid || 0;
    const finalAmount = Math.max(0, grossTotal - advanceDeducted);

    const settlementPayload = { reservationId, orderIds, tableLabel };

    if (finalAmount <= 0) {
      const settlement = await finalizeBillSettlement(settlementPayload);

      return res.json({
        success: true,
        amountPaid: 0,
        advanceDeducted,
        grossTotal,
        finalAmount: 0,
        ordersUpdated: settlement.updatedOrderCount,
        message: "Bill settled. Advance payment covered the full amount.",
      });
    }

    // Handle UPI payments without Stripe verification
    if (paymentMethod === "UPI") {
      const settlement = await finalizeBillSettlement(settlementPayload);

      await Payment.create({
        orderId: settlement.primaryOrderId,
        reservationId,
        amount: finalAmount,
        advanceDeducted,
        paymentMethod: "UPI",
        paymentType: "Bill",
        status: "Succeeded",
      });

      return res.json({
        success: true,
        amountPaid: finalAmount,
        advanceDeducted,
        grossTotal,
        finalAmount,
        ordersUpdated: settlement.updatedOrderCount,
        message: "UPI payment completed successfully.",
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent is required." });
    }

    await verifyPaymentIntent(paymentIntentId, finalAmount);

    const settlement = await finalizeBillSettlement(settlementPayload);

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        orderId: settlement.primaryOrderId,
        reservationId,
        amount: finalAmount,
        advanceDeducted,
        status: "Succeeded",
      },
      { new: true },
    );

    res.json({
      success: true,
      amountPaid: finalAmount,
      advanceDeducted,
      grossTotal,
      finalAmount,
      paymentIntentId,
      ordersUpdated: settlement.updatedOrderCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { amount, orderId, reservationId, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    await Payment.create({
      orderId,
      reservationId,
      amount,
      paymentMethod: paymentMethod || "Card",
      stripePaymentIntentId: paymentIntent.id,
      paymentType: orderId ? "Bill" : "Order",
      status: "Pending",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/cash", auth, async (req, res) => {
  try {
    const { amount, orderId, reservationId } = req.body;

    const payment = await Payment.create({
      amount,
      orderId,
      reservationId,
      paymentMethod: "Cash",
      paymentType: orderId ? "Bill" : "Order",
      status: "Succeeded",
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/upi", auth, async (req, res) => {
  try {
    const { amount, orderId, reservationId } = req.body;

    const payment = await Payment.create({
      amount,
      orderId,
      reservationId,
      paymentMethod: "UPI",
      paymentType: orderId ? "Bill" : "Order",
      status: "Succeeded",
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("orderId")
      .populate("reservationId")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("orderId")
      .populate("reservationId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
