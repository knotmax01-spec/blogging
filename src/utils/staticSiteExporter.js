export const exportAllBlogsAsZip = async (posts) => {
  const JSZip = (await import('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')).default;
  
  if (!JSZip) {
    alert('Unable to load ZIP library. Please try again.');
    return;
  }

  const zip = new JSZip();

  posts.forEach((post, index) => {
    const htmlContent = generateStandaloneBlogHTML(post);
    zip.file(`${post.slug}.html`, htmlContent);
  });

  zip.generateAsync({ type: 'blob' }).then((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-static-site.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
};

export const generateStandaloneBlogHTML = (post) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    
    <!-- Primary Meta Tags -->
    <title>${post.title} | Health Blog | ClinicStreams</title>
    <meta name="title" content="${post.title} | Health Blog | ClinicStreams">
    <meta name="description" content="${post.metaDescription}">
    <meta name="keywords" content="${post.keywords}, clinicstreams, aazhidigital, health blog">
    <meta name="author" content="${post.author || 'Anonymous'}">
    <meta name="robots" content="index, follow">
    <meta name="language" content="English">
    <meta name="revisit-after" content="7 days">
    ${post.canonicalUrl ? `<link rel="canonical" href="${post.canonicalUrl}">` : ''}
    
    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${post.title}">
    <meta property="og:description" content="${post.metaDescription}">
    <meta property="og:image" content="${post.featuredImage || 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=' + encodeURIComponent(post.title)}">
    <meta property="og:site_name" content="Health Blog | ClinicStreams">
    <meta property="article:author" content="${post.author || 'Anonymous'}">
    <meta property="article:published_time" content="${post.date}">
    <meta property="article:modified_time" content="${post.lastModified}">
    <meta property="article:section" content="${post.category}">
    <meta property="article:tag" content="${post.tags}">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${post.title}">
    <meta property="twitter:description" content="${post.metaDescription}">
    <meta property="twitter:image" content="${post.featuredImage || 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=' + encodeURIComponent(post.title)}">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
      * { font-family: 'Inter', sans-serif; }
      .prose h1, .prose h2, .prose h3 { scroll-margin-top: 2rem; }
      .prose img { border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    </style>
  </head>
  <body class="bg-gray-50 text-gray-900">
    <!-- Navigation -->
    <nav class="bg-white shadow-md border-b sticky top-0 z-40">
      <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <a href="blog-library.html" class="text-2xl font-bold text-teal-600">⚕️ Health Blog</a>
        <a href="blog-library.html" class="text-teal-600 hover:text-teal-800 font-semibold">← Back to Library</a>
      </div>
    </nav>
    
    <div class="max-w-4xl mx-auto p-8">
      <article class="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <!-- Article Header -->
        <header class="mb-8">
          ${post.featuredImage ? `<img src="${post.featuredImage}" alt="${post.title}" class="w-full h-64 object-cover rounded-lg mb-6 shadow-md">` : ''}
          
          <div class="flex flex-wrap items-center gap-2 mb-4">
            ${post.category ? `<span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">${post.category}</span>` : ''}
            ${post.tags ? post.tags.split(',').slice(0, 3).map(tag => `<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">${tag.trim()}</span>`).join('') : ''}
          </div>
          
          <h1 class="text-4xl font-bold mb-4 leading-tight text-gray-900">${post.title}</h1>
          
          <div class="flex items-center text-sm text-gray-600 mb-4 flex-wrap gap-3 pb-4 border-b">
            <span>By <strong>${post.author || 'Anonymous'}</strong></span>
            <span>•</span>
            <time>${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
            <span>•</span>
            <span>${post.readingTime || 5} min read</span>
            <span>•</span>
            <span>${post.wordCount} words</span>
          </div>
          
          ${post.metaDescription ? `<p class="text-lg text-gray-600 leading-relaxed italic">${post.metaDescription}</p>` : ''}
        </header>
        
        <!-- Article Content -->
        <div class="prose prose-lg max-w-none mb-8">
          ${post.content}
        </div>
        
        <!-- Article Footer -->
        <footer class="mt-8 pt-8 border-t">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="text-sm text-gray-600">
              Last updated: ${new Date(post.lastModified).toLocaleDateString()}
            </div>
            <div class="flex space-x-4">
              <a href="blog-library.html" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                ��� Back to Library
              </a>
            </div>
          </div>
        </footer>
      </article>
      
      <!-- Related Articles Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p class="text-gray-700">
          <a href="blog-library.html" class="text-blue-600 hover:text-blue-800 font-semibold">← Browse all articles</a>
        </p>
      </div>
    </div>

    <footer class="bg-gray-900 text-white py-8 px-4 mt-16">
      <div class="max-w-4xl mx-auto text-center">
        <p class="text-gray-400 mb-2">© ${new Date().getFullYear()} Health Blog. All rights reserved.</p>
        <p class="text-gray-500 text-sm">
          Powered by
          <a href="https://clinicstreams.com" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 transition">ClinicStreams</a>
          &amp;
          <a href="https://aazhidigital.com" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 transition">Aazhi Digital</a>
        </p>
      </div>
    </footer>
  </body>
</html>
  `;
  
  return html;
};

export const downloadBlogAsHTML = (post) => {
  const html = generateStandaloneBlogHTML(post);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${post.slug}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
