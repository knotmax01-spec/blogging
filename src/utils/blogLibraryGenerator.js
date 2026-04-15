export const generateBlogLibraryHTML = (blogs) => {
  const categoriesSet = new Set(blogs.map(b => b.category).filter(Boolean));
  const categories = Array.from(categoriesSet).sort();
  
  const tagsSet = new Set();
  blogs.forEach(b => {
    if (b.tags) {
      b.tags.split(',').forEach(tag => tagsSet.add(tag.trim()));
    }
  });
  const tags = Array.from(tagsSet).sort();

  const blogCardsHTML = blogs.map(blog => `
    <article class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200">
      ${blog.featuredImage ? `
        <div class="overflow-hidden bg-gray-200 h-48">
          <img src="${blog.featuredImage}" alt="${blog.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
        </div>
      ` : '<div class="bg-gradient-to-br from-blue-400 to-blue-600 h-48 flex items-center justify-center"><span class="text-white text-4xl font-bold">${blog.title.charAt(0)}</span></div>'}
      
      <div class="p-6">
        <div class="flex items-center justify-between mb-3">
          ${blog.category ? `<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">${blog.category}</span>` : '<span></span>'}
          <span class="text-sm text-gray-500">${blog.readingTime} min read</span>
        </div>
        
        <a href="${blog.htmlFileName}" class="group">
          <h2 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
            ${blog.title}
          </h2>
        </a>
        
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">
          ${blog.excerpt}
        </p>
        
        ${blog.tags ? `
          <div class="mb-4 flex flex-wrap gap-2">
            ${blog.tags.split(',').map(tag => `
              <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                ${tag.trim()}
              </span>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
          <div>
            <span class="font-medium text-gray-900">${blog.author || 'Anonymous'}</span>
            <span class="mx-1">•</span>
            <time>${new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
          </div>
          <a href="${blog.htmlFileName}" class="text-blue-600 hover:text-blue-800 font-semibold">
            Read →
          </a>
        </div>
      </div>
    </article>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Blog Library | All Articles | ClinicStreams</title>
        <meta name="description" content="Explore our comprehensive health blog library with expert articles on wellness, nutrition, and medical insights. Powered by ClinicStreams and Aazhi Digital.">
        <meta name="keywords" content="health blog, articles, clinicstreams, aazhidigital, ${categories.join(', ')}">
        <meta name="author" content="ClinicStreams &amp; Aazhi Digital">
        <meta name="robots" content="index, follow">
        <link rel="canonical" href="https://clinicstreams.com/blog">
        
        <!-- Open Graph -->
        <meta property="og:type" content="website">
        <meta property="og:title" content="Blog Library | All Articles | ClinicStreams">
        <meta property="og:description" content="Explore our comprehensive health blog library with expert articles on wellness, nutrition, and medical insights.">
        <meta property="og:site_name" content="Health Blog | ClinicStreams">
        
        <!-- Twitter -->
        <meta property="twitter:card" content="summary">
        <meta property="twitter:title" content="Blog Library | All Articles | ClinicStreams">
        <meta property="twitter:description" content="Explore our comprehensive health blog library with expert articles on wellness, nutrition, and medical insights.">
        
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <style>
          * { font-family: 'Inter', sans-serif; }
          .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        </style>
      </head>
      <body class="bg-gray-50">
        <!-- Navigation -->
        <nav class="bg-white shadow-md sticky top-0 z-50">
          <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="./" class="text-2xl font-bold text-teal-600">⚕️ Health Blog</a>
            <div class="flex items-center space-x-6">
              <a href="#" onclick="scrollToSection('featured')" class="text-gray-700 hover:text-blue-600 font-medium transition">Featured</a>
              <a href="#" onclick="scrollToSection('latest')" class="text-gray-700 hover:text-blue-600 font-medium transition">Latest</a>
              <a href="#categories" class="text-gray-700 hover:text-blue-600 font-medium transition">Categories</a>
            </div>
          </div>
        </nav>

        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
          <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">Blog Library</h1>
            <p class="text-xl text-blue-100 mb-8">Discover insightful articles, guides, and stories. ${blogs.length} articles in our collection.</p>
            
            <!-- Search and Filter -->
            <div class="flex flex-col md:flex-row gap-4 mt-8">
              <div class="flex-1">
                <input type="text" id="searchInput" placeholder="Search articles..." class="w-full px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300">
              </div>
              <select id="categoryFilter" class="px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">All Categories</option>
                ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
              </select>
            </div>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="bg-white border-b py-8 px-4">
          <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold text-blue-600">${blogs.length}</div>
              <p class="text-gray-600 mt-2">Total Articles</p>
            </div>
            <div>
              <div class="text-4xl font-bold text-blue-600">${categories.length}</div>
              <p class="text-gray-600 mt-2">Categories</p>
            </div>
            <div>
              <div class="text-4xl font-bold text-blue-600">${Math.round(blogs.reduce((sum, b) => sum + (b.readingTime || 0), 0) / blogs.length || 0)}</div>
              <p class="text-gray-600 mt-2">Avg. Read Time (min)</p>
            </div>
          </div>
        </section>

        <!-- Featured Article -->
        ${blogs.length > 0 ? `
          <section id="featured" class="bg-white py-12 px-4">
            <div class="max-w-6xl mx-auto">
              <h2 class="text-3xl font-bold mb-8">Featured Article</h2>
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
                <div class="flex flex-col md:flex-row gap-8 items-center">
                  ${blogs[0].featuredImage ? `
                    <div class="w-full md:w-1/3">
                      <img src="${blogs[0].featuredImage}" alt="${blogs[0].title}" class="w-full h-64 object-cover rounded-lg">
                    </div>
                  ` : ''}
                  <div class="w-full ${blogs[0].featuredImage ? 'md:w-2/3' : ''}">
                    ${blogs[0].category ? `<span class="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">${blogs[0].category}</span>` : ''}
                    <a href="${blogs[0].htmlFileName}" class="block">
                      <h3 class="text-3xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition">
                        ${blogs[0].title}
                      </h3>
                    </a>
                    <p class="text-gray-700 mb-4 text-lg">
                      ${blogs[0].excerpt}
                    </p>
                    <div class="flex items-center text-sm text-gray-600 mb-6">
                      <span class="font-medium text-gray-900">${blogs[0].author || 'Anonymous'}</span>
                      <span class="mx-2">•</span>
                      <time>${new Date(blogs[0].date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                      <span class="mx-2">•</span>
                      <span>${blogs[0].readingTime || 5} min read</span>
                    </div>
                    <a href="${blogs[0].htmlFileName}" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                      Read Full Article →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ` : ''}

        <!-- Latest Articles -->
        <section id="latest" class="bg-gray-50 py-16 px-4">
          <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold mb-12">Latest Articles</h2>
            <div id="blogGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              ${blogCardsHTML}
            </div>
            <div id="noResults" class="text-center py-12 hidden">
              <p class="text-gray-500 text-lg">No articles found. Try adjusting your search or filter.</p>
            </div>
          </div>
        </section>

        <!-- Categories Section -->
        <section id="categories" class="bg-white py-16 px-4">
          <div class="max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold mb-8">Browse by Category</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              ${categories.map(cat => {
                const count = blogs.filter(b => b.category === cat).length;
                return `
                  <a href="#" onclick="filterByCategory('${cat}'); return false;" class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition text-center">
                    <div class="font-bold text-gray-900">${cat}</div>
                    <div class="text-sm text-gray-600">${count} article${count !== 1 ? 's' : ''}</div>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </section>

        <!-- Footer -->
        <footer class="bg-gray-900 text-white py-12 px-4 mt-16">
          <div class="max-w-6xl mx-auto text-center">
            <p class="text-gray-400 mb-2">© ${new Date().getFullYear()} Health Blog Library. All rights reserved.</p>
            <p class="text-gray-500 text-sm">
              Powered by
              <a href="https://clinicstreams.com" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 transition">ClinicStreams</a>
              &amp;
              <a href="https://aazhidigital.com" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 transition">Aazhi Digital</a>
            </p>
          </div>
        </footer>

        <script>
          const allBlogs = ${JSON.stringify(blogs)};
          
          function filterBlogs() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const category = document.getElementById('categoryFilter').value;
            
            const filtered = allBlogs.filter(blog => {
              const matchesSearch = blog.title.toLowerCase().includes(searchTerm) || 
                                   blog.excerpt.toLowerCase().includes(searchTerm) ||
                                   (blog.tags && blog.tags.toLowerCase().includes(searchTerm));
              const matchesCategory = !category || blog.category === category;
              return matchesSearch && matchesCategory;
            });
            
            const grid = document.getElementById('blogGrid');
            const noResults = document.getElementById('noResults');
            
            if (filtered.length === 0) {
              grid.innerHTML = '';
              noResults.classList.remove('hidden');
            } else {
              noResults.classList.add('hidden');
              grid.innerHTML = filtered.map(blog => \`
                <article class="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200">
                  \${blog.featuredImage ? \`
                    <div class="overflow-hidden bg-gray-200 h-48">
                      <img src="\${blog.featuredImage}" alt="\${blog.title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                    </div>
                  \` : '<div class="bg-gradient-to-br from-blue-400 to-blue-600 h-48 flex items-center justify-center"><span class="text-white text-4xl font-bold">\${blog.title.charAt(0)}</span></div>'}
                  
                  <div class="p-6">
                    <div class="flex items-center justify-between mb-3">
                      \${blog.category ? \`<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">\${blog.category}</span>\` : '<span></span>'}
                      <span class="text-sm text-gray-500">\${blog.readingTime} min read</span>
                    </div>
                    
                    <a href="\${blog.htmlFileName}" class="group">
                      <h2 class="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        \${blog.title}
                      </h2>
                    </a>
                    
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">
                      \${blog.excerpt}
                    </p>
                    
                    \${blog.tags ? \`
                      <div class="mb-4 flex flex-wrap gap-2">
                        \${blog.tags.split(',').map(tag => \`
                          <span class="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            \${tag.trim()}
                          </span>
                        \`).join('')}
                      </div>
                    \` : ''}
                    
                    <div class="flex items-center justify-between text-xs text-gray-500 border-t pt-4">
                      <div>
                        <span class="font-medium text-gray-900">\${blog.author || 'Anonymous'}</span>
                        <span class="mx-1">•</span>
                        <time>\${new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
                      </div>
                      <a href="\${blog.htmlFileName}" class="text-blue-600 hover:text-blue-800 font-semibold">
                        Read →
                      </a>
                    </div>
                  </div>
                </article>
              \`).join('');
            }
          }
          
          function filterByCategory(category) {
            document.getElementById('categoryFilter').value = category;
            filterBlogs();
            document.getElementById('latest').scrollIntoView({ behavior: 'smooth' });
          }
          
          function scrollToSection(id) {
            const element = document.getElementById(id);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }
          
          document.getElementById('searchInput').addEventListener('input', filterBlogs);
          document.getElementById('categoryFilter').addEventListener('change', filterBlogs);
        </script>
      </body>
    </html>
  `;

  return html;
};

export const exportBlogLibraryAsFile = (blogs, fileName = 'blog-library.html') => {
  const html = generateBlogLibraryHTML(blogs);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
