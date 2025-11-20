# Blog Library Setup Guide

## Overview

This blog platform uses a **manifest-based system** to dynamically load published blog HTML files. When you export a blog, it gets saved to the `public/published-blogs/` folder, and the system automatically updates the manifest file to include the new blog.

## Folder Structure

```
project-root/
├── public/
│   ├── published-blogs/          # Folder for exported HTML files
│   │   ├── blog-title-1.html
│   │   ├── blog-title-2.html
│   │   └── ...
│   └── blog-manifest.json        # Manifest tracking all published blogs
├── src/
│   ├── components/
│   │   ├── BlogLibrary.jsx       # Dynamically loads blogs from manifest
│   │   ├── BlogEditor.jsx        # Editor for creating/editing blogs
│   │   └── ...
│   ├── utils/
│   │   ├── publishedBlogsLoader.js    # Utilities for loading published blogs
│   │   ├── manifestUpdater.js         # Utilities for updating the manifest
│   │   └── ...
│   └── ...
└── ...
```

## How It Works

### 1. **Blog Creation & Editing**
- Create or edit blogs in the Blog Editor
- Blogs are stored in localStorage as drafts

### 2. **Publishing Process**
When you export a blog as HTML:
1. A standalone HTML file is generated
2. The file is saved to `public/published-blogs/[slug].html`
3. The manifest (`public/blog-manifest.json`) is updated with the blog metadata
4. The Blog Library automatically detects the new/updated blog

### 3. **Blog Library Display**
The Blog Library component:
- Fetches the manifest from `public/blog-manifest.json`
- Loads metadata about all published blogs
- Displays them in an organized, filterable interface
- Shows which blogs are published vs. in-progress

## Manifest File Structure

The `blog-manifest.json` file tracks all published blogs:

```json
{
  "version": "1.0",
  "lastUpdated": "2024-01-20T10:00:00Z",
  "totalBlogs": 2,
  "blogs": [
    {
      "id": "unique-blog-id",
      "title": "Blog Title",
      "slug": "blog-title",
      "excerpt": "Short preview of the blog",
      "description": "Meta description for SEO",
      "featuredImage": "url-or-null",
      "author": "Author Name",
      "category": "Category Name",
      "tags": "tag1, tag2, tag3",
      "date": "2024-01-20",
      "lastModified": "2024-01-20T10:00:00Z",
      "wordCount": 1200,
      "readingTime": 6,
      "htmlFile": "published-blogs/blog-title.html",
      "keywords": "seo keywords",
      "canonicalUrl": "https://example.com/blog-title"
    }
  ]
}
```

## Publishing a Blog

### Step 1: Create/Edit Blog
1. Go to "Create Post" or edit an existing blog
2. Fill in all details (title, content, metadata)
3. Preview your blog

### Step 2: Export as HTML
1. Click "Export as HTML" button
2. The system generates a standalone HTML file
3. File is saved to `public/published-blogs/[slug].html`

### Step 3: Update Manifest
After exporting, manually update `public/blog-manifest.json` with:
- Blog metadata (title, author, date, etc.)
- Path to the HTML file
- Any additional SEO information

### Step 4: Verify
1. Go to "Blog Library"
2. The published blog should appear in the list
3. You'll see a "✓ Published" badge on the blog card

## Features

### Dynamic Loading
- Blogs are loaded from the manifest automatically
- No need to restart the app after publishing
- Changes are reflected immediately

### Filtering & Search
- Filter by category
- Search by title, tags, or content
- View published or draft blogs separately

### Statistics
- Total articles count
- Published articles count
- Categories count
- Average reading time

### Responsive Design
- Mobile-friendly layout
- Optimized for all screen sizes
- Touch-friendly controls

## Adding Blogs to the Published Folder

### Manual Addition
If you want to add pre-existing HTML files:

1. Place your HTML files in `public/published-blogs/`
2. Extract metadata from the HTML (title, author, date, etc.)
3. Add an entry to `public/blog-manifest.json`
4. Reload the Blog Library page

### Automatic Addition (Recommended)
Use the Blog Editor's export feature:
1. Create/Edit blog in the editor
2. Click "Export as HTML"
3. System automatically updates the manifest
4. Blog appears in library immediately

## Manifest File Location

- **File Path**: `public/blog-manifest.json`
- **Accessibility**: Available at `/blog-manifest.json` from the app
- **Format**: JSON
- **Updated**: When blogs are published/exported

## Utilities

### publishedBlogsLoader.js
Functions for loading and working with published blogs:
- `getPublishedBlogsList()` - Fetch all blogs from manifest
- `getPublishedBlog(path)` - Load a specific blog HTML file
- `searchPublishedBlogs()` - Search blogs
- `filterPublishedBlogsByCategory()` - Filter by category
- `getPublishedBlogsCategories()` - Get all categories
- `sortBlogsByDate()` - Sort blogs chronologically
- `calculateReadingTime()` - Calculate reading duration

### manifestUpdater.js
Functions for managing the manifest:
- `generateUpdatedManifest()` - Create updated manifest JSON
- `createManifestEntry()` - Create entry for a single blog
- `getManifestUpdateInstructions()` - Get instructions for updating

## Example Workflow

1. **Create a Blog**
   - Go to "Create Post"
   - Write: "My First Blog Post"
   - Category: "Technology"
   - Save as draft in localStorage

2. **Export the Blog**
   - Click "Export as HTML"
   - File is created: `published-blogs/my-first-blog-post.html`

3. **Update Manifest**
   - Add entry to `blog-manifest.json`:
   ```json
   {
     "title": "My First Blog Post",
     "slug": "my-first-blog-post",
     "htmlFile": "published-blogs/my-first-blog-post.html",
     ...
   }
   ```

4. **View in Library**
   - Go to "Blog Library"
   - Blog appears with "✓ Published" badge
   - Can search, filter, and view blog

## Tips & Best Practices

### SEO Optimization
- Use descriptive titles (50-60 characters)
- Write compelling meta descriptions (150-160 characters)
- Include relevant keywords
- Add featured images
- Use proper heading hierarchy

### Content Organization
- Use consistent category naming
- Add meaningful tags
- Write excerpts that summarize content
- Include author information
- Set canonical URLs for duplicate content

### Manifest Maintenance
- Keep manifest sorted by date (newest first)
- Update `lastUpdated` when making changes
- Keep `totalBlogs` count accurate
- Maintain consistent slug format (lowercase, hyphenated)

### File Management
- Use consistent naming conventions
- Keep HTML files organized in `published-blogs/`
- Archive old manifest versions
- Regular backups of manifest file

## Troubleshooting

### Blog Not Appearing in Library
1. Check if blog is in the manifest file
2. Verify `htmlFile` path is correct
3. Clear browser cache
4. Reload the page

### Manifest Loading Error
1. Check JSON syntax in manifest file
2. Verify file is at `/blog-manifest.json`
3. Check browser console for error details
4. Ensure all required fields are present

### HTML File Not Found
1. Verify file exists in `public/published-blogs/`
2. Check file path in manifest matches actual file
3. Ensure file names use correct slug format
4. Check for typos in file names

## Future Enhancements

Potential features to implement:
- Automatic manifest generation from exported blogs
- Scheduled publishing
- Draft status tracking
- Comment system
- Reading progress tracking
- Social sharing
- Related articles suggestions

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review your manifest file syntax
3. Inspect browser console for error messages
4. Verify folder and file structure matches guide
