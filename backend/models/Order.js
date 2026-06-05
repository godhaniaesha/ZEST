const mongoose = require('mongoose');

// Reload schema on server restart (avoids stale cached model with old `id` field)
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    table: { type: String, required: true },
    tableNumber: { type: Number },
    waiter: { type: String, required: true },
    items: { type: String, required: true },
    orderItems: [orderItemSchema],
    type: { type: String, enum: ['Cafe', 'Bar'], required: true },
    amount: { type: String, required: true },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Served', 'Cancelled'],
      default: 'Pending',
    },
    time: { type: String, default: 'Just now' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  },
  { timestamps: true, id: false }
);

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret.orderCode;
    return ret;
  },
});

orderSchema.set('toObject', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret.orderCode;
    return ret;
  },
});

orderSchema.pre('validate', async function ensureOrderCode() {
  if (!this.orderCode) {
    const count = await this.constructor.countDocuments();
    this.orderCode = `#T-${1020 + count + 1}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);
