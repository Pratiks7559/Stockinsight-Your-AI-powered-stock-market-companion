// models/Portfolio.js
import mongoose from "mongoose"

const holdingSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  avgPrice: {
    type: Number,
    required: true,
    min: 0
  },
  sector: {
    type: String,
    required: true
  }
})

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  holdings: [holdingSchema],
  realizedPL: {
    type: Number,
    default: 0
  },
  cashBalance: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
})

// Ensure one portfolio per user
portfolioSchema.index({ user: 1 }, { unique: true })

export default mongoose.model('Portfolio', portfolioSchema);