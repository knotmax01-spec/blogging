import cron from 'node-cron';
import BlogPost from '../models/BlogPost.js';
import TrendingTopic from '../models/TrendingTopic.js';
import { getTrendingHealthcareTopics, researchTopic } from './trendAnalyzer.js';
import { generateBlogPost } from './contentGenerator.js';

// Store active jobs for management
export const activeJobs = {
  trends: null,
  posts: [],
};

export function initializeScheduler() {
  console.log('Initializing AI Blog Scheduler...');

  const time1 = process.env.SCHEDULE_TIME_1 || '09:00';
  const time2 = process.env.SCHEDULE_TIME_2 || '14:00';
  const time3 = process.env.SCHEDULE_TIME_3 || '18:00';

  // Schedule daily trend analysis at 6 AM (before first post)
  activeJobs.trends = cron.schedule('0 6 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running daily trend analysis...`);
    try {
      await analyzeDailyTrends();
    } catch (error) {
      console.error('Error in trend analysis scheduler:', error);
    }
  });

  // Schedule blog post generation at configured times
  const times = [time1, time2, time3];
  times.forEach((time, index) => {
    const [hours, minutes] = time.split(':');
    const job = cron.schedule(`${minutes} ${hours} * * *`, async () => {
      console.log(`[${new Date().toISOString()}] Running scheduled blog post generation (${index + 1}/3)...`);
      try {
        await generateAndPublishPost();
      } catch (error) {
        console.error('Error in post generation scheduler:', error);
      }
    });
    activeJobs.posts.push(job);
  });

  console.log(`✓ Scheduler initialized with posts at: ${times.join(', ')} UTC`);
  console.log('✓ Trend analysis scheduled at: 06:00 UTC');
}

export async function analyzeDailyTrends() {
  try {
    console.log('Fetching trending healthcare topics...');
    const topics = await getTrendingHealthcareTopics();

    if (!topics || topics.length === 0) {
      console.log('No trending topics found');
      return;
    }

    for (const topicData of topics) {
      const existing = await TrendingTopic.findOne({ topic: topicData.topic });
      
      if (!existing) {
        const topic = new TrendingTopic(topicData);
        await topic.save();
        console.log(`✓ Added trending topic: ${topicData.topic}`);
      }
    }
  } catch (error) {
    console.error('Error analyzing daily trends:', error);
  }
}

export async function generateAndPublishPost() {
  try {
    // Find an unprocessed trending topic
    const unprocessedTopic = await TrendingTopic.findOne({ isProcessed: false })
      .sort({ relevanceScore: -1 });

    if (!unprocessedTopic) {
      console.log('No unprocessed topics available for blog generation');
      return null;
    }

    console.log(`Generating blog post for topic: ${unprocessedTopic.topic}`);

    // Research the topic
    const researchNotes = await researchTopic(unprocessedTopic.topic);
    console.log('Research completed, generating blog post...');

    // Generate blog post
    const postData = await generateBlogPost(unprocessedTopic.topic, researchNotes);

    if (!postData) {
      console.error('Failed to generate blog post');
      unprocessedTopic.isProcessed = true;
      unprocessedTopic.processedAt = new Date();
      await unprocessedTopic.save();
      return null;
    }

    // Create and save the blog post
    const blogPost = new BlogPost({
      ...postData,
      isPublished: true,
      isDraft: false,
      isAIGenerated: true,
      date: new Date(),
    });

    await blogPost.save();
    console.log(`✓ Blog post published: "${postData.title}"`);

    // Update trending topic
    unprocessedTopic.isProcessed = true;
    unprocessedTopic.processedAt = new Date();
    unprocessedTopic.postGenerated = blogPost._id;
    await unprocessedTopic.save();

    return blogPost;
  } catch (error) {
    console.error('Error in generateAndPublishPost:', error);
    return null;
  }
}

export function stopScheduler() {
  if (activeJobs.trends) {
    activeJobs.trends.stop();
  }
  activeJobs.posts.forEach(job => job.stop());
  console.log('Scheduler stopped');
}

// Manual triggers for testing/admin
export async function triggerTrendAnalysis() {
  console.log('Manual trigger: Analyzing trends...');
  return await analyzeDailyTrends();
}

export async function triggerPostGeneration(topicId = null) {
  console.log('Manual trigger: Generating post...');
  if (topicId) {
    const topic = await TrendingTopic.findById(topicId);
    if (topic) {
      const researchNotes = await researchTopic(topic.topic);
      const postData = await generateBlogPost(topic.topic, researchNotes);
      if (postData) {
        const blogPost = new BlogPost({
          ...postData,
          isPublished: true,
          isDraft: false,
          isAIGenerated: true,
        });
        await blogPost.save();
        topic.isProcessed = true;
        topic.postGenerated = blogPost._id;
        await topic.save();
        return blogPost;
      }
    }
  } else {
    return await generateAndPublishPost();
  }
}
