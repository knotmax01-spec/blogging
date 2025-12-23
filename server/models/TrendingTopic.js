import mongoose from 'mongoose';

const trendingTopicSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    trend: {
      type: String,
      enum: ['evolution', 'innovation', 'emerging'],
      default: 'emerging',
    },
    description: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['google', 'linkedin', 'perplexity'],
      default: 'perplexity',
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
    postGenerated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BlogPost',
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

trendingTopicSchema.index({ isProcessed: 1 });
trendingTopicSchema.index({ relevanceScore: -1 });
trendingTopicSchema.index({ discoveredAt: -1 });

export default mongoose.model('TrendingTopic', trendingTopicSchema);
