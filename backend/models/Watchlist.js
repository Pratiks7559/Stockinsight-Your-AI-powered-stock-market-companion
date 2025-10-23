// backend/models/Watchlist.js
import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symbols: [{
    symbol: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure one watchlist per user
watchlistSchema.index({ user: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);