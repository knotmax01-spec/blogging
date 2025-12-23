import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    keywords: {
      type: String,
      trim: true,
    },
    author: {
      type: String,
      default: 'Health Blogger',
    },
    category: {
      type: String,
      trim: true,
    },
    tags: {
      type: String,
      trim: true,
    },
    featuredImage: {
      type: String,
    },
    canonicalUrl: {
      type: String,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    isAIGenerated: {
      type: Boolean,
      default: true,
    },
    trendingTopic: {
      type: String,
      trim: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    sections: {
      evolution: {
        type: String,
      },
      innovations: {
        type: String,
      },
      usage: {
        type: String,
      },
      benefits: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
blogPostSchema.index({ date: -1 });
blogPostSchema.index({ isPublished: 1 });
blogPostSchema.index({ trendingTopic: 1 });

// Calculate word count and reading time
blogPostSchema.pre('save', function (next) {
  if (this.content) {
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.ceil(words / 200);
  }
  this.lastModified = new Date();
  next();
});

export default mongoose.model('BlogPost', blogPostSchema);
