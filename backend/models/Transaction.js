// models/Transaction.js
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  executedAt: {
    type: Date,
    default: Date.now
  },
  mode: {
    type: String,
    enum: ['SIMULATION', 'BROKER'],
    default: 'SIMULATION'
  },
  brokerOrderId: {
    type: String,
    sparse: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'EXECUTED', 'CANCELLED'],
    default: 'EXECUTED'
  },
  fees: {
    type: Number,
    default: 0
  },
  idempotencyKey: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ user: 1, executedAt: -1 });
transactionSchema.index({ user: 1, symbol: 1 });
// Index already defined in schema field

export default mongoose.model('Transaction', transactionSchema);