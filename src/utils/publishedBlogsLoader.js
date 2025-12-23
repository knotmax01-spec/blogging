/**
 * Fetches the blog manifest and returns list of published blogs
 */
export const getPublishedBlogsList = async () => {
  try {
    const response = await fetch('/blog-manifest.json');
    if (!response.ok) {
      throw new Error('Failed to load blog manifest');
    }
    const manifest = await response.json();
    return manifest.blogs || [];
  } catch (error) {
    console.error('Error loading published blogs:', error);
    return [];
  }
};

/**
 * Updates the blog manifest with a new blog entry
 * This function is typically called from the server/build process
 */
export const addBlogToPublishedList = async (blogData) => {
  const blogEntry = {
    id: blogData.id,
    title: blogData.title,
    slug: blogData.slug || generateSlug(blogData.title),
    excerpt: blogData.excerpt || blogData.metaDescription || getExcerpt(blogData.content, 120),
    description: blogData.metaDescription,
    featuredImage: blogData.featuredImage,
    author: blogData.author || 'Anonymous',
    category: blogData.category,
    tags: blogData.tags,
    date: blogData.date,
    lastModified: blogData.lastModified || new Date().toISOString(),
    wordCount: blogData.wordCount || 0,
    readingTime: blogData.readingTime || 5,
    htmlFile: `published-blogs/${blogData.slug || generateSlug(blogData.title)}.html`,
    keywords: blogData.keywords,
    canonicalUrl: blogData.canonicalUrl
  };

  return blogEntry;
};

/**
 * Fetches and parses a single published blog HTML file
 */
export const getPublishedBlog = async (blogPath) => {
  try {
    const response = await fetch(`/${blogPath}`);
    if (!response.ok) {
      throw new Error('Failed to load blog');
    }
    const html = await response.text();
    return html;
  } catch (error) {
    console.error('Error loading blog:', error);
    return null;
  }
};

/**
 * Generates a URL-friendly slug from a title
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Extracts excerpt from content
 */
export const getExcerpt = (content, maxLength = 150) => {
  const plainText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#*`>\-\[\]]/g, '')
    .trim();
  
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength).trim() + '...';
};

/**
 * Searches published blogs by title, content, or tags
 */
export const searchPublishedBlogs = (blogs, searchTerm) => {
  const lowerSearchTerm = searchTerm.toLowerCase();
  return blogs.filter(blog => {
    const titleMatch = blog.title.toLowerCase().includes(lowerSearchTerm);
    const excerptMatch = blog.excerpt.toLowerCase().includes(lowerSearchTerm);
    const tagsMatch = blog.tags && blog.tags.toLowerCase().includes(lowerSearchTerm);
    return titleMatch || excerptMatch || tagsMatch;
  });
};

/**
 * Filters published blogs by category
 */
export const filterPublishedBlogsByCategory = (blogs, category) => {
  if (!category) return blogs;
  return blogs.filter(blog => blog.category === category);
};

/**
 * Gets unique categories from published blogs
 */
export const getPublishedBlogsCategories = (blogs) => {
  const categories = new Set(
    blogs
      .map(blog => blog.category)
      .filter(Boolean)
  );
  return Array.from(categories).sort();
};

/**
 * Sorts blogs by date (newest first)
 */
export const sortBlogsByDate = (blogs, ascending = false) => {
  return [...blogs].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Gets reading time for a blog
 */
export const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const plainText = content.replace(/<[^>]*>/g, '').replace(/[#*`>\-\[\]]/g, '');
  const wordCount = plainText.split(/\s+/).filter(word => word).length;
  return Math.ceil(wordCount / wordsPerMinute);
};
