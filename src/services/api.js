const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Blog Posts API
export const blogAPI = {
  // Get all published posts
  getAllPosts: async (limit = 50, skip = 0) => {
    const response = await fetch(`${API_BASE_URL}/blog?limit=${limit}&skip=${skip}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Get AI-generated posts
  getAIPosts: async (limit = 50, skip = 0) => {
    const response = await fetch(`${API_BASE_URL}/blog/ai?limit=${limit}&skip=${skip}`);
    if (!response.ok) throw new Error('Failed to fetch AI posts');
    return response.json();
  },

  // Get posts by category
  getPostsByCategory: async (category, limit = 50, skip = 0) => {
    const response = await fetch(
      `${API_BASE_URL}/blog/category/${category}?limit=${limit}&skip=${skip}`
    );
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  // Get single post by ID
  getPostById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`);
    if (!response.ok) throw new Error('Post not found');
    return response.json();
  },

  // Get single post by slug
  getPostBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/blog/slug/${slug}`);
    if (!response.ok) throw new Error('Post not found');
    return response.json();
  },

  // Create post (manual)
  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        metaDescription: postData.metaDescription,
        keywords: postData.keywords,
        author: postData.author,
        category: postData.category,
        tags: postData.tags,
        featuredImage: postData.featuredImage,
        canonicalUrl: postData.canonicalUrl,
        wordCount: postData.wordCount,
        readingTime: postData.readingTime,
        isPublished: postData.isPublished || false,
        isAIGenerated: false,
      }),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  // Update post
  updatePost: async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        metaDescription: postData.metaDescription,
        keywords: postData.keywords,
        author: postData.author,
        category: postData.category,
        tags: postData.tags,
        featuredImage: postData.featuredImage,
        canonicalUrl: postData.canonicalUrl,
        wordCount: postData.wordCount,
        readingTime: postData.readingTime,
        isPublished: postData.isPublished || false,
      }),
    });
    if (!response.ok) throw new Error('Failed to update post');
    return response.json();
  },

  // Publish blog post HTML and update manifest
  publishPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/blog/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: postData.title,
        slug: postData.slug,
        content: postData.content,
        author: postData.author,
        category: postData.category,
        tags: postData.tags,
        metaDescription: postData.metaDescription,
        excerpt: postData.excerpt,
      }),
    });
    if (!response.ok) throw new Error('Failed to publish post');
    return response.json();
  },

  // Delete post
  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/blog/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete post');
    return response.json();
  },

  // Get blog statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/blog/stats/summary`);
    if (!response.ok) throw new Error('Failed to fetch statistics');
    return response.json();
  },
};

// Admin API
export const adminAPI = {
  // Get trending topics
  getTrendingTopics: async (processed = false, limit = 20) => {
    const response = await fetch(
      `${API_BASE_URL}/admin/trends?processed=${processed}&limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },

  // Trigger trend analysis
  triggerTrendAnalysis: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/trends/analyze`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to trigger trend analysis');
    return response.json();
  },

  // Trigger post generation
  triggerPostGeneration: async (topicId = null) => {
    const response = await fetch(`${API_BASE_URL}/admin/posts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId }),
    });
    if (!response.ok) throw new Error('Failed to trigger post generation');
    return response.json();
  },

  // Get scheduler status
  getSchedulerStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/scheduler/status`);
    if (!response.ok) throw new Error('Failed to fetch scheduler status');
    return response.json();
  },

  // Get logs
  getLogs: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/logs`);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return response.json();
  },
};
