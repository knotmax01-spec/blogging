import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, '../../public/blog-manifest.json');
const BLOGS_DIR = path.join(__dirname, '../../public/published-blogs');

export async function ensureDirectoriesExist() {
  if (!fs.existsSync(BLOGS_DIR)) {
    fs.mkdirSync(BLOGS_DIR, { recursive: true });
  }
}

export async function loadManifest() {
  try {
    if (!fs.existsSync(MANIFEST_PATH)) {
      return {
        blogs: [],
        totalBlogs: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
    const content = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading manifest:', error.message);
    return {
      blogs: [],
      totalBlogs: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function saveManifest(manifest) {
  try {
    await ensureDirectoriesExist();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving manifest:', error.message);
    throw error;
  }
}

export async function publishBlogHTML(blogData) {
  try {
    await ensureDirectoriesExist();

    const {
      title,
      slug,
      content,
      author,
      category,
      tags = [],
      metaDescription,
      excerpt,
    } = blogData;

    if (!title || !slug || !content) {
      throw new Error('Missing required fields: title, slug, content');
    }

    // Generate HTML file
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDescription || excerpt || 'Health blog article'}">
    <meta name="keywords" content="${tags.join(', ')}">
    <title>${title} | Health Blog</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        article { background: white; }
        h1 { font-size: 2.5rem; margin: 1rem 0; color: #0a7490; }
        h2 { font-size: 1.8rem; margin: 1.5rem 0 0.5rem 0; color: #0d9488; }
        .meta { color: #666; font-size: 0.9rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
        .meta span { margin-right: 1.5rem; }
        .content { margin: 2rem 0; }
        p { margin-bottom: 1rem; }
        img { max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px; }
        footer { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee; color: #666; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="container">
        <article>
            <h1>${title}</h1>
            <div class="meta">
                <span>By <strong>${author || 'Health Blogger'}</strong></span>
                <span>Category: <strong>${category || 'Healthcare'}</strong></span>
                <span>Published: <strong>${new Date().toLocaleDateString()}</strong></span>
            </div>
            <div class="content">
${content}
            </div>
            <footer>
                <p>This article was published on our Health Blog. For more information, visit our main blog.</p>
            </footer>
        </article>
    </div>
</body>
</html>`;

    // Save HTML file
    const htmlFilename = `${slug}.html`;
    const htmlPath = path.join(BLOGS_DIR, htmlFilename);
    fs.writeFileSync(htmlPath, htmlContent);

    // Update manifest
    const manifest = await loadManifest();
    const existingIndex = manifest.blogs.findIndex(b => b.slug === slug);
    const blogEntry = {
      title,
      slug,
      author: author || 'Health Blogger',
      category: category || 'Healthcare',
      tags: tags,
      excerpt: excerpt || content.substring(0, 200),
      date: new Date().toISOString(),
      htmlFile: htmlFilename,
      url: `/published-blogs/${htmlFilename}`,
    };

    if (existingIndex >= 0) {
      manifest.blogs[existingIndex] = blogEntry;
    } else {
      manifest.blogs.push(blogEntry);
    }

    manifest.totalBlogs = manifest.blogs.length;
    manifest.lastUpdated = new Date().toISOString();

    await saveManifest(manifest);

    return {
      success: true,
      message: 'Blog published successfully',
      url: `/published-blogs/${htmlFilename}`,
      slug,
    };
  } catch (error) {
    console.error('Error publishing blog:', error.message);
    throw error;
  }
}
