import { generateSlug, getExcerpt, calculateReadingTime } from './publishedBlogsLoader';

/**
 * Generates the complete manifest content with all blogs
 * This should be called after exporting blogs to update the manifest file
 */
export const generateUpdatedManifest = (blogs) => {
  const blogEntries = blogs.map(blog => ({
    id: blog.id,
    title: blog.title,
    slug: blog.slug || generateSlug(blog.title),
    excerpt: blog.excerpt || blog.metaDescription || getExcerpt(blog.content, 120),
    description: blog.metaDescription,
    featuredImage: blog.featuredImage,
    author: blog.author || 'Anonymous',
    category: blog.category || 'Uncategorized',
    tags: blog.tags || '',
    date: blog.date,
    lastModified: blog.lastModified || new Date().toISOString(),
    wordCount: blog.wordCount || 0,
    readingTime: blog.readingTime || calculateReadingTime(blog.content),
    htmlFile: `published-blogs/${blog.slug || generateSlug(blog.title)}.html`,
    keywords: blog.keywords || '',
    canonicalUrl: blog.canonicalUrl || ''
  }));

  const manifest = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    totalBlogs: blogEntries.length,
    blogs: blogEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
  };

  return JSON.stringify(manifest, null, 2);
};

/**
 * Creates a manifest entry for a single blog
 * Used when publishing individual blogs
 */
export const createManifestEntry = (blog) => {
  const slug = blog.slug || generateSlug(blog.title);
  return {
    id: blog.id,
    title: blog.title,
    slug: slug,
    excerpt: blog.excerpt || blog.metaDescription || getExcerpt(blog.content, 120),
    description: blog.metaDescription,
    featuredImage: blog.featuredImage,
    author: blog.author || 'Anonymous',
    category: blog.category || 'Uncategorized',
    tags: blog.tags || '',
    date: blog.date,
    lastModified: blog.lastModified || new Date().toISOString(),
    wordCount: blog.wordCount || 0,
    readingTime: blog.readingTime || calculateReadingTime(blog.content),
    htmlFile: `published-blogs/${slug}.html`,
    keywords: blog.keywords || '',
    canonicalUrl: blog.canonicalUrl || ''
  };
};

/**
 * Generates instructions/metadata for updating the manifest
 * Since this is a static site, we provide information about what files to create/update
 */
export const getManifestUpdateInstructions = (blogs) => {
  const slug = blogs[0]?.slug || generateSlug(blogs[0]?.title);
  const htmlFileName = `${slug}.html`;
  
  return {
    message: 'To complete the export, follow these steps:',
    steps: [
      `1. Create folder: public/published-blogs/`,
      `2. Save HTML file: public/published-blogs/${htmlFileName}`,
      `3. Update manifest: public/blog-manifest.json with the latest blog data`,
      `4. The blog library will automatically fetch and display from the manifest`
    ],
    manifestPath: 'public/blog-manifest.json',
    blogsFolder: 'public/published-blogs/'
  };
};
