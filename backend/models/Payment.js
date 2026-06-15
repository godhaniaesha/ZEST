const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
    },

    amount: {
      type: Number,
      required: true,
    },

    advanceDeducted: {
      type: Number,
      default: 0,
    },

    paymentType: {
      type: String,
      enum: ["Advance", "Bill", "Order"],
      default: "Order",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI"],
      required: true,
    },

    stripePaymentIntentId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["Pending", "Succeeded", "Failed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
