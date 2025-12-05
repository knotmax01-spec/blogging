import express from 'express';
import BlogPost from '../models/BlogPost.js';

const router = express.Router();

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { limit = 50, skip = 0, sort = '-date' } = req.query;
    const posts = await BlogPost.find({ isPublished: true })
      .sort(sort)
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    const total = await BlogPost.countDocuments({ isPublished: true });
    res.json({ posts, total, limit: parseInt(limit), skip: parseInt(skip) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI-generated posts
router.get('/ai', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const posts = await BlogPost.find({ isAIGenerated: true, isPublished: true })
      .sort('-date')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    const total = await BlogPost.countDocuments({ isAIGenerated: true, isPublished: true });
    res.json({ posts, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get posts by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const posts = await BlogPost.find({ category, isPublished: true })
      .sort('-date')
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    const total = await BlogPost.countDocuments({ category, isPublished: true });
    res.json({ posts, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create blog post (manual)
router.post('/', async (req, res) => {
  try {
    const post = new BlogPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update blog post
router.put('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete blog post
router.delete('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get blog statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await BlogPost.countDocuments({ isPublished: true });
    const aiGenerated = await BlogPost.countDocuments({
      isAIGenerated: true,
      isPublished: true,
    });
    const manual = total - aiGenerated;
    const categories = await BlogPost.distinct('category', { isPublished: true });
    const avgWordCount = await BlogPost.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, avg: { $avg: '$wordCount' } } },
    ]);

    res.json({
      total,
      aiGenerated,
      manual,
      categories,
      avgWordCount: avgWordCount[0]?.avg || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
