import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import RichTextEditor from './RichTextEditor';
import ImageGallery from './ImageGallery';
import { addBlogToManifest, removeBlogFromManifest } from '../utils/blogManifest';
import { generateBlogLibraryHTML, exportBlogLibraryAsFile } from '../utils/blogLibraryGenerator';
import { validatePostData, validateTitle, validateContent, validateMetaDescription, validateUrl, sanitizeBlogPost } from '../utils/validation';
import { compressImage, generateImageFilename, createImageMetadata, saveImageMetadata, getImageMetadata, saveImageData, getImageData, validateImageFile, formatFileSize } from '../utils/imageManager';

function BlogEditor() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState('default');
  const [isDragging, setIsDragging] = useState(false);
  const [showPublishOptions, setShowPublishOptions] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropZoneRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      const post = posts.find(p => p.id === Number(id));
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setMetaDescription(post.metaDescription || '');
        setKeywords(post.keywords || '');
        setAuthor(post.author || '');
        setCategory(post.category || '');
        setTags(post.tags || '');
        setFeaturedImage(post.featuredImage || '');
        setCanonicalUrl(post.canonicalUrl || '');
        setLayout(post.layout || 'default');

        // Load images using new imageManager
        const imageMetadata = getImageMetadata(Number(id)) || [];
        setImages(imageMetadata);
      }
    }
  }, [id, isEditing]);

  const processFiles = async (files) => {
    const postId = isEditing ? Number(id) : Date.now();

    for (const file of files) {
      // Validate file before processing
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(`Error with ${file.name}:\n${validation.errors.join('\n')}`);
        continue;
      }

      try {
        // Compress the image
        const compressed = await compressImage(file, 1200, 0.8);

        // Generate unique filename and ID
        const imageId = Date.now().toString() + Math.random().toString(36).substring(7);
        const filename = generateImageFilename(file);

        // Create metadata
        const metadata = createImageMetadata({
          id: imageId,
          filename,
          originalName: file.name,
          size: compressed.blob.size,
          width: compressed.width,
          height: compressed.height,
          dataUrl: compressed.dataUrl,
          alt: file.name
        });

        // Save image data
        saveImageData(imageId, compressed.dataUrl);
        saveImageMetadata(postId, metadata);

        // Add to state
        setImages(prev => [...prev, metadata]);

        // Add to content with proper markdown
        setContent(prev => `${prev}\n![${file.name}](${imageId})`);
      } catch (error) {
        console.error('Error processing image:', error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }
  };

  const handleImageUpload = useCallback(async (e) => {
    await processFiles(Array.from(e.target.files));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(Array.from(e.dataTransfer.files));
  }, []);

  const validateForm = useCallback(() => {
    const fieldValidations = {
      title: validateTitle(title),
      content: validateContent(content),
      metaDescription: validateMetaDescription(metaDescription),
      canonicalUrl: validateUrl(canonicalUrl),
      featuredImage: validateUrl(featuredImage)
    };

    const errors = {};
    Object.entries(fieldValidations).forEach(([field, validation]) => {
      if (!validation.isValid) {
        errors[field] = validation.error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content, metaDescription, canonicalUrl, featuredImage]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      alert('Please fix the validation errors below');
      return;
    }

    setIsSubmitting(true);
    try {
      // Generate SEO-friendly slug
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Auto-generate meta description if not provided
      const autoMetaDescription = metaDescription || 
        content.replace(/[#*`>\-\[\]]/g, '').substring(0, 160) + '...';

      // Extract reading time
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / wordsPerMinute);

      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      const postId = isEditing ? Number(id) : Date.now();

      // Note: Images are already stored via imageManager during upload
      // Just track the image IDs in the post
      const imageIds = images.map(img => img.id);

      const post = sanitizeBlogPost({
        id: postId,
        title,
        content: content,
        metaDescription: autoMetaDescription,
        keywords,
        author,
        category,
        tags,
        featuredImage,
        canonicalUrl,
        slug,
        wordCount,
        readingTime,
        layout,
        imageIds: imageIds,
        date: isEditing ? posts.find(p => p.id === Number(id)).date : new Date().toISOString(),
        lastModified: new Date().toISOString()
      });

      let updatedPosts;
      if (isEditing) {
        updatedPosts = posts.map(p => p.id === Number(id) ? post : p);
      } else {
        updatedPosts = [...posts, post];
      }
      
      try {
        localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
      } catch (e) {
        while (updatedPosts.length > 0) {
          updatedPosts.shift();
          try {
            localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
            break;
          } catch (e) {
            if (updatedPosts.length === 1) {
              throw new Error('Cannot save post: not enough storage space');
            }
          }
        }
      }

      const getLayoutClasses = () => {
        switch (layout) {
          case 'centered':
            return 'max-w-2xl mx-auto';
          case 'wide':
            return 'max-w-6xl mx-auto';
          case 'sidebar':
            return 'grid grid-cols-[300px_1fr] gap-8';
          default:
            return 'max-w-4xl mx-auto';
        }
      };

      // Generate structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": autoMetaDescription,
        "image": featuredImage || "https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=" + encodeURIComponent(title),
        "author": {
          "@type": "Person",
          "name": author || "Anonymous"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Blog Generator",
          "logo": {
            "@type": "ImageObject",
            "url": "https://via.placeholder.com/200x60/4F46E5/FFFFFF?text=Blog"
          }
        },
        "datePublished": isEditing ? posts.find(p => p.id === Number(id)).date : new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl || `https://yourdomain.com/blog/${slug}`
        },
        "wordCount": wordCount,
        "keywords": keywords,
        "articleSection": category,
        "inLanguage": "en-US"
      };

      // Create content with proper image paths for HTML export
      let contentWithImages = content;
      images.forEach(img => {
        // Keep image IDs in the markdown for now
        // They'll be converted to proper paths when viewing
        const imagePath = `/blog-images/inline/${img.filename}`;
        contentWithImages = contentWithImages.replace(
          new RegExp(`!\\[([^\\]]*)]\\(${img.id}\\)`, 'g'),
          `![${img.originalName}](${imagePath})`
        );
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            
            <!-- Primary Meta Tags -->
            <title>${title} | Blog Generator</title>
            <meta name="title" content="${title} | Blog Generator">
            <meta name="description" content="${autoMetaDescription}">
            <meta name="keywords" content="${keywords}">
            <meta name="author" content="${author || 'Anonymous'}">
            <meta name="robots" content="index, follow">
            <meta name="language" content="English">
            <meta name="revisit-after" content="7 days">
            ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
            
            <!-- Open Graph / Facebook -->
            <meta property="og:type" content="article">
            <meta property="og:url" content="${canonicalUrl || `https://yourdomain.com/blog/${slug}`}">
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${autoMetaDescription}">
            <meta property="og:image" content="${featuredImage || `https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=${encodeURIComponent(title)}`}">
            <meta property="og:site_name" content="Blog Generator">
            <meta property="article:author" content="${author || 'Anonymous'}">
            <meta property="article:published_time" content="${isEditing ? posts.find(p => p.id === Number(id)).date : new Date().toISOString()}">
            <meta property="article:modified_time" content="${new Date().toISOString()}">
            <meta property="article:section" content="${category}">
            <meta property="article:tag" content="${tags}">
            
            <!-- Twitter -->
            <meta property="twitter:card" content="summary_large_image">
            <meta property="twitter:url" content="${canonicalUrl || `https://yourdomain.com/blog/${slug}`}">
            <meta property="twitter:title" content="${title}">
            <meta property="twitter:description" content="${autoMetaDescription}">
            <meta property="twitter:image" content="${featuredImage || `https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=${encodeURIComponent(title)}`}">
            <meta name="twitter:creator" content="@yourusername">
            
            <!-- Additional SEO Meta Tags -->
            <meta name="theme-color" content="#4F46E5">
            <meta name="msapplication-TileColor" content="#4F46E5">
            <link rel="icon" type="image/x-icon" href="/favicon.ico">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
            
            <!-- Structured Data -->
            <script type="application/ld+json">
              ${JSON.stringify(structuredData, null, 2)}
            </script>
            
            <!-- Preconnect to external domains -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            
            <style>
              body { font-family: 'Inter', sans-serif; }
              .prose h1, .prose h2, .prose h3 { scroll-margin-top: 2rem; }
              .prose img { border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            </style>
          </head>
          <body class="bg-gray-50 text-gray-900">
            <!-- Breadcrumb Navigation -->
            <nav class="bg-white shadow-sm border-b" aria-label="Breadcrumb">
              <div class="max-w-4xl mx-auto px-4 py-3">
                <ol class="flex items-center space-x-2 text-sm">
                  <li><a href="/" class="text-blue-600 hover:text-blue-800">Home</a></li>
                  <li class="text-gray-400">/</li>
                  <li><a href="/blog" class="text-blue-600 hover:text-blue-800">Blog</a></li>
                  <li class="text-gray-400">/</li>
                  <li class="text-gray-600 truncate">${title}</li>
                </ol>
              </div>
            </nav>
            
            <div class="${getLayoutClasses()} p-8">
              <article class="bg-white rounded-lg shadow-sm border p-8 mb-8">
                <!-- Article Header -->
                <header class="mb-8">
                  ${featuredImage ? `<img src="${featuredImage}" alt="${title}" class="w-full h-64 object-cover rounded-lg mb-6">` : ''}
                  
                  <div class="flex flex-wrap items-center gap-2 mb-4">
                    ${category ? `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">${category}</span>` : ''}
                    ${tags ? tags.split(',').map(tag => `<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">${tag.trim()}</span>`).join('') : ''}
                  </div>
                  
                  <h1 class="text-4xl font-bold mb-4 leading-tight">${title}</h1>
                  
                  <div class="flex items-center text-sm text-gray-600 mb-4">
                    <span>By <strong>${author || 'Anonymous'}</strong></span>
                    <span class="mx-2">•</span>
                    <time datetime="${isEditing ? posts.find(p => p.id === Number(id)).date : new Date().toISOString()}">
                      ${new Date(isEditing ? posts.find(p => p.id === Number(id)).date : new Date().toISOString()).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </time>
                    <span class="mx-2">•</span>
                    <span>${readingTime} min read</span>
                    <span class="mx-2">•</span>
                    <span>${wordCount} words</span>
                  </div>
                  
                  ${autoMetaDescription ? `<p class="text-lg text-gray-600 leading-relaxed">${autoMetaDescription}</p>` : ''}
                </header>
                
                <!-- Article Content -->
                <div class="prose prose-lg max-w-none">
                  ${contentWithImages}
                </div>
                
                <!-- Article Footer -->
                <footer class="mt-8 pt-8 border-t">
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                      Last updated: ${new Date().toLocaleDateString()}
                    </div>
                    <div class="flex space-x-4">
                      <button onclick="shareArticle()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Share Article
                      </button>
                    </div>
                  </div>
                </footer>
              </article>
              
              <!-- Table of Contents (if headers exist) -->
              <div id="toc-container" class="bg-white rounded-lg shadow-sm border p-6 mb-8" style="display: none;">
                <h2 class="text-xl font-bold mb-4">Table of Contents</h2>
                <nav id="table-of-contents"></nav>
              </div>
              
              <div class="bg-white rounded-lg shadow-md p-8">
                <h2 class="text-2xl font-bold mb-6">Comments</h2>
                <div id="comments-container">
                  <!-- Comments will be loaded here -->
                </div>
                <div class="mt-8">
                  <h3 class="text-xl font-bold mb-4">Add a Comment</h3>
                  <form id="comment-form" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input type="text" id="name" required class="w-full p-2 border rounded">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <div class="flex items-center space-x-1">
                        <div id="star-rating"></div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea id="comment" required class="w-full p-2 border rounded" rows="4"></textarea>
                    </div>
                    <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                      Submit Comment
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <script>
              const postId = '${post.id}';
              const commentsKey = 'blog-comments';
              
              // Generate Table of Contents
              function generateTOC() {
                const headers = document.querySelectorAll('.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6');
                if (headers.length === 0) return;
                
                const toc = document.getElementById('table-of-contents');
                const tocContainer = document.getElementById('toc-container');
                
                let tocHTML = '<ul class="space-y-2">';
                headers.forEach((header, index) => {
                  const id = 'heading-' + index;
                  header.id = id;
                  const level = parseInt(header.tagName.charAt(1));
                  const indent = (level - 1) * 1.5;
                  
                  tocHTML += \`
                    <li style="margin-left: \${indent}rem;">
                      <a href="#\${id}" class="text-blue-600 hover:text-blue-800 text-sm">
                        \${header.textContent}
                      </a>
                    </li>
                  \`;
                });
                tocHTML += '</ul>';
                
                toc.innerHTML = tocHTML;
                tocContainer.style.display = 'block';
              }
              
              // Share functionality
              function shareArticle() {
                if (navigator.share) {
                  navigator.share({
                    title: '${title}',
                    text: '${autoMetaDescription}',
                    url: window.location.href
                  });
                } else {
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    alert('Link copied to clipboard!');
                  });
                }
              }
              
              // Initialize on page load
              document.addEventListener('DOMContentLoaded', function() {
                generateTOC();
              });
              
              function loadComments() {
                const allComments = JSON.parse(localStorage.getItem(commentsKey) || '{}');
                const comments = allComments[postId] || [];
                const container = document.getElementById('comments-container');
                
                if (comments.length === 0) {
                  container.innerHTML = '<p class="text-gray-500 text-center">No comments yet. Be the first to comment!</p>';
                  return;
                }
                
                container.innerHTML = comments.map(comment => \`
                  <div class="border-b pb-6 mb-6">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-bold">\${comment.userName}</span>
                      <time class="text-gray-500 text-sm">
                        \${new Date(comment.date).toLocaleDateString()}
                      </time>
                    </div>
                    <div class="flex items-center mb-2">
                      \${Array(5).fill('★').map((star, i) => 
                        \`<span class="\${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}">\${star}</span>\`
                      ).join('')}
                    </div>
                    <p class="text-gray-700">\${comment.content}</p>
                  </div>
                \`).join('');
              }

              const starRating = document.getElementById('star-rating');
              let currentRating = 0;
              
              starRating.innerHTML = Array(5).fill('★').map((star, i) => \`
                <button type="button" data-rating="\${i + 1}" class="text-2xl text-gray-300 hover:text-yellow-400">
                  \${star}
                </button>
              \`).join('');
              
              starRating.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                  currentRating = parseInt(e.target.dataset.rating);
                  updateStars();
                }
              });
              
              function updateStars() {
                starRating.querySelectorAll('button').forEach((btn, i) => {
                  btn.className = \`text-2xl \${i < currentRating ? 'text-yellow-400' : 'text-gray-300'}\`;
                });
              }

              document.getElementById('comment-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const comment = {
                  id: Date.now(),
                  userName: document.getElementById('name').value,
                  content: document.getElementById('comment').value,
                  rating: currentRating,
                  date: new Date().toISOString()
                };
                
                const allComments = JSON.parse(localStorage.getItem(commentsKey) || '{}');
                allComments[postId] = [...(allComments[postId] || []), comment];
                localStorage.setItem(commentsKey, JSON.stringify(allComments));
                
                e.target.reset();
                currentRating = 0;
                updateStars();
                
                loadComments();
              });

              loadComments();
            </script>
          </body>
        </html>
      `;

      addBlogToManifest(post);

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${post.slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Blog ${isEditing ? 'updated' : 'published'} successfully! HTML file downloaded.`);
      setIsSubmitting(false);
      navigate('/');
    } catch (error) {
      console.error('Error saving post:', error);
      setIsSubmitting(false);
      alert('Error saving post: ' + error.message);
    }
  }, [isEditing, id, title, content, metaDescription, keywords, author, category, tags, featuredImage, canonicalUrl, images, layout, navigate, validateForm]);

  const getPreviewClasses = useCallback(() => {
    switch (layout) {
      case 'centered':
        return 'max-w-2xl mx-auto';
      case 'wide':
        return 'w-full';
      case 'sidebar':
        return 'grid grid-cols-[300px_1fr] gap-8';
      default:
        return 'max-w-4xl mx-auto';
    }
  }, [layout]);

  // Custom components for ReactMarkdown to handle image preview
  const components = useMemo(() => ({
    img: ({src, alt}) => {
      // Check if src is an image ID from our system
      const imageMetadata = images.find(img => img.id === src);
      const imageSrc = imageMetadata ? imageMetadata.dataUrl : src;

      return (
        <img
          src={imageSrc}
          alt={alt || 'Image'}
          className="max-w-full h-auto rounded-lg shadow-md my-2"
          loading="lazy"
        />
      );
    }
  }), [images]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200">
          <h1 className="text-4xl font-bold mb-2">{isEditing ? '✏️ Edit Article' : '📝 Create Health Article'}</h1>
          <p className="text-gray-600 text-lg">{isEditing ? 'Update your health article and regenerate HTML' : 'Write, preview, and publish your health article'}</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Article Title</label>
          <input
            type="text"
            placeholder="Enter a compelling health article title..."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 font-medium transition ${validationErrors.title ? 'border-red-500' : 'border-gray-300'}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Article title"
            aria-invalid={!!validationErrors.title}
            aria-describedby={validationErrors.title ? 'title-error' : undefined}
            maxLength="200"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">{title.length}/200 characters</p>
            {validationErrors.title && (
              <p id="title-error" className="text-red-600 text-sm" role="alert">
                ✗ {validationErrors.title}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="image-upload" className="block text-sm font-bold text-gray-700">
            🖼️ Upload Medical Images
          </label>
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-8 transition-all ${
              isDragging ? 'border-teal-500 bg-teal-50 scale-105' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            role="region"
            aria-label="Image upload area"
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-100 file:text-teal-700
                hover:file:bg-teal-200 hover:file:cursor-pointer"
              aria-label="File upload for images"
            />
            <p className="text-center text-gray-600 mt-3 font-medium">
              {isDragging ? '✨ Drop images here!' : '🖼️ Drag and drop images here or click to upload'}
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Supported formats: JPG, PNG, WebP. Max 10MB per image.
            </p>
          </div>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>📷</span>
                <span>Uploaded Images ({images.length})</span>
              </h3>
              <ImageGallery
                images={images}
                postId={isEditing ? Number(id) : undefined}
                onImageDelete={(imageId) => {
                  setImages(prev => prev.filter(img => img.id !== imageId));
                  setContent(prev => prev.replace(new RegExp(`!\\[[^\\]]*\\]\\(${imageId}\\)`, 'g'), ''));
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label htmlFor="layout-select" className="block text-sm font-bold text-gray-700">Layout Style</label>
          <select
            id="layout-select"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium bg-white"
            aria-label="Article layout style"
          >
            <option value="default">📄 Default</option>
            <option value="centered">⬜ Centered</option>
            <option value="wide">📐 Wide</option>
            <option value="sidebar">📑 With Sidebar</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-bold text-gray-700">Content</label>
          <RichTextEditor
            content={content}
            onChange={setContent}
          />
          {validationErrors.content && (
            <p className="text-red-600 text-sm mt-1" role="alert">
              {validationErrors.content}
            </p>
          )}
        </div>
        
        {/* SEO Section */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl border-2 border-teal-200 space-y-6">
          <h3 className="text-2xl font-bold text-teal-900 flex items-center space-x-2">
            <span>🔍</span>
            <span>SEO & Metadata</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                rows="3"
                maxLength="160"
                placeholder="Brief health article summary for search engines..."
              />
              <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Used for SEO preview</span>
                <span className="font-medium">{metaDescription.length}/160</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Health Keywords
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="health, wellness, nutrition, fitness"
              />
              <p className="text-xs text-gray-500 mt-2">Separate with commas</p>
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Author/Healthcare Provider
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="e.g., Dr. Jane Smith, MD"
              />
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Health Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="e.g., Nutrition, Mental Health, Fitness"
              />
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Health Topics/Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="wellness, prevention, medical"
              />
            </div>

            <div className="bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="https://example.com/health-image.jpg"
              />
            </div>

            <div className="md:col-span-2 bg-white p-5 rounded-xl border-2 border-teal-100">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Canonical URL <span className="text-xs font-normal text-gray-500">(Optional)</span>
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                placeholder="https://yourdomain.com/health/article-title"
              />
              <p className="text-xs text-gray-500 mt-2">Leave empty to auto-generate</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`w-full px-6 py-3 rounded-xl font-bold transition-all duration-200 text-lg ${
              isSubmitting
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:from-emerald-600 hover:to-teal-700'
            }`}
            aria-label={isEditing ? 'Update and generate HTML' : 'Publish and generate HTML'}
          >
            {isSubmitting ? '⏳ Publishing...' : (isEditing ? '✅ Update & Generate HTML' : '🚀 Publish Health Article')}
          </button>
          <button
            onClick={() => setShowPublishOptions(!showPublishOptions)}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 font-bold transition-all duration-200"
          >
            {showPublishOptions ? '✕ Hide' : '⚙️ Show'} Advanced Options
          </button>
        </div>

        {showPublishOptions && (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200 space-y-4">
            <h3 className="font-bold text-teal-900 text-lg flex items-center space-x-2">
              <span>⚙️</span>
              <span>Export & Publish Options</span>
            </h3>
            <button
              onClick={() => {
                const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
                const libraryHTML = generateBlogLibraryHTML(posts);
                const blob = new Blob([libraryHTML], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'blog-library.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="w-full group bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-cyan-700 font-bold text-sm transition-all duration-200"
            >
              📚 Export Health Article Library (Index Page)
            </button>
            <button
              onClick={() => {
                const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
                const postsWithHtml = posts.map(p => ({
                  ...p,
                  fileName: `${p.slug}.html`
                }));
                const zip = { posts: postsWithHtml, totalPosts: posts.length, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(zip, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'health-articles-manifest.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="w-full group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 font-bold text-sm transition-all duration-200"
            >
              📋 Export Health Articles Manifest (JSON)
            </button>
            <div className="bg-white p-4 rounded-lg border border-teal-200 mt-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>💡 Pro Tip:</strong> Export your health article library to get a standalone index page listing all your articles. You can then download individual article HTML files to host them on a health information website.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-2 border-gray-300 rounded-2xl p-8 bg-white shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">👁️</span>
          <h2 className="text-3xl font-bold">Live Preview</h2>
        </div>
        <div className={`${getPreviewClasses()} bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl border-2 border-gray-200`}>
          {title ? (
            <>
              <h1 className="text-4xl font-bold mb-6 text-gray-900">{title}</h1>
              <div className="prose prose-lg max-w-none text-gray-800">
                <ReactMarkdown components={components}>
                  {content || '✍️ Start typing your content here...'}
                </ReactMarkdown>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-40">📝</div>
              <p className="text-gray-500 text-lg">Enter a title and start writing to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogEditor;
