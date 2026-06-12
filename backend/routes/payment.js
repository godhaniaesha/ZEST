const express = require("express");
const Stripe = require("stripe");
const Payment = require("../models/Payment");
const { auth } = require("../middleware/auth");

const router = express.Router();

const stripe = Stripe(process.env.STRIPE_SECRET);

/*
|--------------------------------------------------------------------------
| Create Stripe Payment Intent
|--------------------------------------------------------------------------
*/
router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const {
      amount,
      orderId,
      reservationId,
    } = req.body;

    const paymentIntent =
      await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "inr",
        automatic_payment_methods: {
          enabled: true,
        },
      });

    await Payment.create({
      orderId,
      reservationId,
      amount,
      paymentMethod: "Card",
      stripePaymentIntentId: paymentIntent.id,
      status: "Pending",
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Cash Payment
|--------------------------------------------------------------------------
*/
router.post("/cash", auth, async (req, res) => {
  try {
    const {
      amount,
      orderId,
      reservationId,
    } = req.body;

    const payment = await Payment.create({
      amount,
      orderId,
      reservationId,
      paymentMethod: "Cash",
      status: "Succeeded",
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| UPI Payment
|--------------------------------------------------------------------------
*/
router.post("/upi", auth, async (req, res) => {
  try {
    const {
      amount,
      orderId,
      reservationId,
    } = req.body;

    const payment = await Payment.create({
      amount,
      orderId,
      reservationId,
      paymentMethod: "UPI",
      status: "Succeeded",
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get All Payments
|--------------------------------------------------------------------------
*/
router.get("/", auth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("orderId")
      .populate("reservationId")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Get Payment By ID
|--------------------------------------------------------------------------
*/
router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(
      req.params.id
    )
      .populate("orderId")
      .populate("reservationId");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;