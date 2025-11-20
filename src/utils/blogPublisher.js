import { generateSlug, getExcerpt } from './publishedBlogsLoader';
import { generateStandaloneBlogHTML } from './staticSiteExporter';

/**
 * Complete publishing workflow for a blog
 * Handles HTML generation and manifest information
 */
export const publishBlog = async (blogPost) => {
  try {
    // Generate slug if not provided
    const slug = blogPost.slug || generateSlug(blogPost.title);
    
    // Generate standalone HTML
    const htmlContent = generateStandaloneBlogHTML(blogPost);
    
    // Create manifest entry
    const manifestEntry = {
      id: blogPost.id,
      title: blogPost.title,
      slug: slug,
      excerpt: blogPost.excerpt || blogPost.metaDescription || getExcerpt(blogPost.content, 120),
      description: blogPost.metaDescription,
      featuredImage: blogPost.featuredImage || null,
      author: blogPost.author || 'Anonymous',
      category: blogPost.category || 'Uncategorized',
      tags: blogPost.tags || '',
      date: blogPost.date,
      lastModified: blogPost.lastModified || new Date().toISOString(),
      wordCount: blogPost.wordCount || 0,
      readingTime: blogPost.readingTime || 5,
      htmlFile: `published-blogs/${slug}.html`,
      keywords: blogPost.keywords || '',
      canonicalUrl: blogPost.canonicalUrl || ''
    };

    // Return publishing data
    return {
      success: true,
      slug: slug,
      htmlContent: htmlContent,
      manifestEntry: manifestEntry,
      fileName: `${slug}.html`,
      folderPath: 'public/published-blogs/',
      instructions: getPublishingInstructions(slug)
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get detailed publishing instructions
 */
export const getPublishingInstructions = (slug) => {
  return {
    step1: {
      title: 'Save HTML File',
      description: 'Save the generated HTML file to the public/published-blogs/ folder',
      fileName: `${slug}.html`,
      path: `public/published-blogs/${slug}.html`
    },
    step2: {
      title: 'Update Manifest',
      description: 'Add the blog entry to public/blog-manifest.json',
      file: 'public/blog-manifest.json'
    },
    step3: {
      title: 'Refresh Blog Library',
      description: 'Go to the Blog Library page - your published blog should appear automatically'
    },
    manualSteps: [
      `1. Copy the generated HTML content to: public/published-blogs/${slug}.html`,
      `2. Open public/blog-manifest.json`,
      `3. Add the provided manifest entry to the "blogs" array`,
      `4. Update the "lastUpdated" timestamp`,
      `5. Increment "totalBlogs" count`,
      `6. Save the manifest file`,
      `7. Refresh the Blog Library page`
    ]
  };
};

/**
 * Prepare manifest update payload
 * This data should be added to blog-manifest.json
 */
export const getManifestUpdatePayload = (manifestEntry) => {
  return {
    newEntry: manifestEntry,
    instructions: 'Add this entry to the "blogs" array in public/blog-manifest.json',
    updateFields: [
      'lastUpdated: Set to current ISO timestamp',
      'totalBlogs: Increment by 1'
    ]
  };
};

/**
 * Validates if a blog is ready for publishing
 */
export const validateForPublishing = (blog) => {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!blog.title || blog.title.trim() === '') {
    errors.push('Title is required');
  }
  if (!blog.content || blog.content.trim() === '') {
    errors.push('Content is required');
  }
  if (!blog.date) {
    errors.push('Publication date is required');
  }

  // Recommended fields
  if (!blog.metaDescription) {
    warnings.push('Meta description is recommended for SEO');
  }
  if (!blog.author) {
    warnings.push('Author name is recommended');
  }
  if (!blog.category) {
    warnings.push('Category helps with content organization');
  }
  if (!blog.tags) {
    warnings.push('Tags improve searchability');
  }
  if (!blog.featuredImage) {
    warnings.push('Featured image improves visual appeal');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Exports blog as standalone HTML file
 */
export const exportBlogHTML = (blog) => {
  const result = publishBlog(blog);
  
  if (!result.success) {
    alert(`Error: ${result.error}`);
    return;
  }

  const { htmlContent, fileName } = result;
  
  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show instructions
  console.log('Publishing Instructions:', result.instructions);
  alert(
    `Blog exported successfully!\n\n` +
    `File: ${fileName}\n` +
    `Location: public/published-blogs/\n\n` +
    `Next steps:\n` +
    `1. Save the file to: public/published-blogs/${fileName}\n` +
    `2. Update public/blog-manifest.json with the blog metadata\n` +
    `3. Refresh the Blog Library page\n\n` +
    `See console for detailed instructions.`
  );
};

/**
 * Gets a template for the manifest entry
 */
export const getManifestEntryTemplate = (blog) => {
  const slug = blog.slug || generateSlug(blog.title);
  return {
    id: blog.id,
    title: blog.title,
    slug: slug,
    excerpt: blog.metaDescription || getExcerpt(blog.content, 120),
    description: blog.metaDescription || '',
    featuredImage: blog.featuredImage || null,
    author: blog.author || 'Anonymous',
    category: blog.category || 'Uncategorized',
    tags: blog.tags || '',
    date: blog.date,
    lastModified: new Date().toISOString(),
    wordCount: blog.wordCount || 0,
    readingTime: blog.readingTime || 5,
    htmlFile: `published-blogs/${slug}.html`,
    keywords: blog.keywords || '',
    canonicalUrl: blog.canonicalUrl || ''
  };
};
