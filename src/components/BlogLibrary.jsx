import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateBlogLibraryHTML } from '../utils/blogLibraryGenerator';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';
import { getPublishedBlogsList, sortBlogsByDate } from '../utils/publishedBlogsLoader';

function BlogLibrary() {
  const [posts, setPosts] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'published', 'draft'
  const location = useLocation();

  useEffect(() => {
    const loadBlogs = async () => {
      setIsLoading(true);
      try {
        // Load published blogs from manifest
        const published = await getPublishedBlogsList();
        setPublishedBlogs(published);

        // Load draft blogs from localStorage
        const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');

        // Combine both sources based on filter
        let combinedPosts = [];

        if (filterType === 'all' || filterType === 'published') {
          combinedPosts = [...published];
        }
        if (filterType === 'all' || filterType === 'draft') {
          const draftPosts = savedPosts.filter(post => !published.some(p => p.id === post.id));
          combinedPosts = [...combinedPosts, ...draftPosts];
        }

        const sortedPosts = sortBlogsByDate(combinedPosts);
        setPosts(sortedPosts);

        // Extract unique categories
        const uniqueCategories = [...new Set(sortedPosts.map(p => p.category).filter(Boolean))].sort();
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading blogs:', error);
        // Fallback to localStorage only
        const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        const sortedPosts = savedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
        const uniqueCategories = [...new Set(savedPosts.map(p => p.category).filter(Boolean))].sort();
        setCategories(uniqueCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlogs();
  }, [filterType, location]);

  useEffect(() => {
    const filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.metaDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts]);

  const getAverageRating = (postId) => {
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    const comments = allComments[postId] || [];
    if (comments.length === 0) return null;
    return (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1);
  };

  const exportLibraryHTML = () => {
    const html = generateBlogLibraryHTML(posts);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blog-library.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalReadTime = posts.reduce((sum, p) => sum + (p.readingTime || 0), 0);
  const avgReadTime = posts.length > 0 ? Math.round(totalReadTime / posts.length) : 0;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-900 text-white rounded-2xl p-12 shadow-2xl border border-teal-400/20">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-3">📚 Health Articles Library</h1>
            <p className="text-teal-50 text-lg max-w-xl">Explore comprehensive health articles, wellness guides, and evidence-based medical information. Find your health solutions.</p>
          </div>
          <div className="text-6xl opacity-30 hidden md:block">⚕️</div>
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Search health articles by title, topic, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300 placeholder-gray-500 font-medium"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-5 py-2.5 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300 font-medium bg-white"
              disabled={isLoading}
            >
              <option value="">All Health Topics</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-5 py-2.5 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300 font-medium bg-white"
              disabled={isLoading}
            >
              <option value="all">All Articles</option>
              <option value="published">Published Only</option>
              <option value="draft">Drafts Only</option>
            </select>
            <button
              onClick={exportLibraryHTML}
              className="bg-white text-teal-600 px-6 py-2.5 rounded-lg font-bold hover:shadow-lg hover:bg-teal-50 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
              disabled={isLoading}
            >
              <span>📥</span>
              <span>Export as HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-12 text-center">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600"></div>
          </div>
          <p className="text-gray-700 mt-4 text-lg font-medium">Loading health articles...</p>
        </div>
      )}

      {/* Stats Section */}
      {!isLoading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-teal-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Articles</p>
              <div className="text-4xl font-bold text-teal-600">{posts.length}</div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-emerald-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Published</p>
              <div className="text-4xl font-bold text-emerald-600">{publishedBlogs.length}</div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">✓</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-cyan-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Health Topics</p>
              <div className="text-4xl font-bold text-cyan-600">{categories.length}</div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">🏷️</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Avg Read Time</p>
              <div className="text-4xl font-bold text-blue-600">{avgReadTime} <span className="text-lg text-gray-500">min</span></div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">⏳</div>
          </div>
        </div>
      </div>
      )}

      {/* Featured Article */}
      {posts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-200 hover:shadow-2xl transition-shadow">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-200 flex items-center space-x-3">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl font-bold text-gray-900">Featured Article</h2>
          </div>
          <div className="p-10">
            <Link to={`/post/${posts[0].id}`} className="group">
              <h3 className="text-4xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition line-clamp-2">
                {posts[0].title}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {posts[0].category && (
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-4 py-2 rounded-full">
                  {posts[0].category}
                </span>
              )}
              {posts[0].tags && posts[0].tags.split(',').slice(0, 2).map((tag, i) => (
                <span key={i} className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full">
                  {tag.trim()}
                </span>
              ))}
            </div>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              {posts[0].metaDescription}
            </p>
            <div className="flex items-center text-sm text-gray-600 mb-8 flex-wrap gap-3">
              {posts[0].author && <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{posts[0].author}</span>}
              {posts[0].author && <span className="text-gray-400">•</span>}
              <time className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 font-medium">{new Date(posts[0].date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{posts[0].readingTime || 5} min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{posts[0].wordCount || 0} words</span>
            </div>
            <Link
              to={`/post/${posts[0].id}`}
              className="group inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
            >
              <span className="flex items-center space-x-2">
                <span>Read Full Article</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">
            {selectedCategory ? `${selectedCategory}` : 'All Articles'}
          </h2>
          {filteredPosts.length > 0 && (
            <span className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-full">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => {
              const avgRating = getAverageRating(post.id);
              return (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-200 group flex flex-col h-full hover:border-blue-300"
                >
                  <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 h-48 flex items-center justify-center text-white text-6xl font-bold relative overflow-hidden group-hover:scale-105 transition-transform">
                    {post.title.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition"></div>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex gap-2 items-center flex-wrap">
                        {post.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        )}
                        {publishedBlogs.some(p => p.id === post.id) && (
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <span>✓</span> Published
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">{post.readingTime || 5} min</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-5 flex-1 line-clamp-3 leading-relaxed">
                      {post.metaDescription}
                    </p>

                    {post.tags && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {post.tags.split(',').slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-600 border-t border-gray-200 pt-5 mt-auto">
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                        <span className="font-semibold text-gray-900">{post.author || 'Anonymous'}</span>
                        <span className="text-gray-400">•</span>
                        <time className="text-gray-500">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
                      </div>
                      <div className="flex items-center">
                        {avgRating && (
                          <div className="flex items-center space-x-1 bg-yellow-50 px-2.5 py-1 rounded-lg">
                            <span className="text-yellow-500 font-bold">★</span>
                            <span className="text-xs font-bold text-yellow-700">{avgRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 border-dashed">
            <div className="text-6xl mb-4 opacity-40">🔍</div>
            <p className="text-gray-700 text-lg font-medium mb-6">
              {posts.length === 0 ? 'No posts published yet.' : 'No articles match your search.'}
            </p>
            {posts.length === 0 && (
              <Link to="/new" className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200">
                ✨ Create your first post
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogLibrary;
