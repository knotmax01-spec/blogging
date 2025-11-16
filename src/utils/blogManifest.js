export const getBlogManifest = () => {
  const stored = localStorage.getItem('blog-manifest');
  return stored ? JSON.parse(stored) : { blogs: [], updatedAt: new Date().toISOString() };
};

export const saveBlogManifest = (manifest) => {
  manifest.updatedAt = new Date().toISOString();
  localStorage.setItem('blog-manifest', JSON.stringify(manifest));
};

export const addBlogToManifest = (post) => {
  const manifest = getBlogManifest();
  const existingIndex = manifest.blogs.findIndex(b => b.id === post.id);
  
  const blogEntry = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.metaDescription || post.content.replace(/[#*`>\-\[\]]/g, '').substring(0, 120) + '...',
    featuredImage: post.featuredImage,
    author: post.author,
    category: post.category,
    tags: post.tags,
    date: post.date,
    lastModified: post.lastModified,
    wordCount: post.wordCount,
    readingTime: post.readingTime,
    htmlFileName: `${post.slug}.html`
  };

  if (existingIndex > -1) {
    manifest.blogs[existingIndex] = blogEntry;
  } else {
    manifest.blogs.push(blogEntry);
  }

  manifest.blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveBlogManifest(manifest);
  
  return manifest;
};

export const removeBlogFromManifest = (postId) => {
  const manifest = getBlogManifest();
  manifest.blogs = manifest.blogs.filter(b => b.id !== postId);
  saveBlogManifest(manifest);
  return manifest;
};

export const generateManifestJSON = () => {
  const manifest = getBlogManifest();
  return JSON.stringify(manifest, null, 2);
};

export const exportManifestAsFile = () => {
  const manifest = getBlogManifest();
  const manifestJson = JSON.stringify(manifest, null, 2);
  const blob = new Blob([manifestJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'blog-manifest.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
