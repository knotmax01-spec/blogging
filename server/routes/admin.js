import express from 'express';
import TrendingTopic from '../models/TrendingTopic.js';
import {
  triggerTrendAnalysis,
  triggerPostGeneration,
} from '../utils/scheduler.js';

const router = express.Router();

// Get trending topics
router.get('/trends', async (req, res) => {
  try {
    const { processed = false, limit = 20 } = req.query;
    const filter = processed !== 'all' ? { isProcessed: processed === 'true' } : {};
    const topics = await TrendingTopic.find(filter)
      .sort('-relevanceScore')
      .limit(parseInt(limit));
    const stats = {
      total: await TrendingTopic.countDocuments(),
      processed: await TrendingTopic.countDocuments({ isProcessed: true }),
      pending: await TrendingTopic.countDocuments({ isProcessed: false }),
    };
    res.json({ topics, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger trend analysis
router.post('/trends/analyze', async (req, res) => {
  try {
    await triggerTrendAnalysis();
    res.json({ message: 'Trend analysis triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger post generation
router.post('/posts/generate', async (req, res) => {
  try {
    const { topicId } = req.body;
    const post = await triggerPostGeneration(topicId);
    if (post) {
      res.json({ message: 'Post generated successfully', post });
    } else {
      res.json({ message: 'No topics available or generation failed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scheduler status
router.get('/scheduler/status', (req, res) => {
  try {
    const scheduleTimes = [
      process.env.SCHEDULE_TIME_1 || '09:00',
      process.env.SCHEDULE_TIME_2 || '14:00',
      process.env.SCHEDULE_TIME_3 || '18:00',
    ];
    res.json({
      status: 'running',
      scheduleTimes,
      timezone: 'UTC',
      trendAnalysisTime: '06:00 UTC',
      lastUpdate: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scheduler logs (basic)
router.get('/logs', (req, res) => {
  try {
    res.json({
      message: 'Check server logs for detailed scheduler information',
      endpoint: '/api/admin/scheduler/status',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
