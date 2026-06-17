const express = require("express");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const Reservation = require("../models/Reservation");
const Order = require("../models/Order");
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

  // Add UPI-specific configuration
  if (paymentMethod === "UPI") {
    paymentIntentConfig.payment_method_options = {
      upi: {
        customer_reference: "ZEST_CAFE_BILL",
      },
    };
  }

  return stripe.paymentIntents.create(paymentIntentConfig);
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
    const { reservationId, orderIds, paymentIntentId, subtotal, tax } = req.body;

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
      if (Array.isArray(orderIds) && orderIds.length) {
        await Order.updateMany({ _id: { $in: orderIds } }, { status: "Paid" });
      }

      // Mark reservation as fully paid
      await Reservation.findByIdAndUpdate(reservationId, { fullPaymentDone: true });

      if (reservation.table) {
        const Table = require("../models/Table");
        await Table.findByIdAndUpdate(reservation.table, { status: "Free" });
      }

      return res.json({
        success: true,
        amountPaid: 0,
        advanceDeducted,
        grossTotal,
        finalAmount: 0,
        message: "Bill settled. Advance payment covered the full amount.",
      });
    }

    if (!paymentIntentId) {
      return res.status(400).json({ message: "Payment intent is required." });
    }

    await verifyPaymentIntent(paymentIntentId, finalAmount);

    const primaryOrderId = Array.isArray(orderIds) ? orderIds[0] : null;

    await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      {
        orderId: primaryOrderId,
        reservationId,
        amount: finalAmount,
        advanceDeducted,
        status: "Succeeded",
      },
      { new: true }
    );

    if (Array.isArray(orderIds) && orderIds.length) {
      await Order.updateMany({ _id: { $in: orderIds } }, { status: "Paid" });
    }

    // Mark reservation as fully paid
    await Reservation.findByIdAndUpdate(reservationId, { fullPaymentDone: true });

    if (reservation.table) {
      const Table = require("../models/Table");
      await Table.findByIdAndUpdate(reservation.table, { status: "Free" });
    }

    res.json({
      success: true,
      amountPaid: finalAmount,
      advanceDeducted,
      grossTotal,
      finalAmount,
      paymentIntentId,
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
