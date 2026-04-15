import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Filter, FileDown, Clock, BookOpen, Tag } from 'lucide-react';
import { generateBlogLibraryHTML } from '../utils/blogLibraryGenerator';
import { getPublishedBlogsList, sortBlogsByDate } from '../utils/publishedBlogsLoader';
import { blogAPI } from '../services/api';

function BlogLibrary() {
  const [posts, setPosts] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const location = useLocation();

  useEffect(() => {
    const loadBlogs = async () => {
      setIsLoading(true);
      try {
        const published = await getPublishedBlogsList();
        setPublishedBlogs(published);

        let serverPosts = [];
        try {
          const res = await blogAPI.getAllPosts(200);
          serverPosts = res.posts || [];
        } catch {
          // fall through to localStorage
        }

        const savedPosts = serverPosts.length > 0
          ? serverPosts
          : JSON.parse(localStorage.getItem('blog-posts') || '[]');

        let combined = [];
        if (filterType === 'all' || filterType === 'published') combined = [...published];
        if (filterType === 'all' || filterType === 'draft') {
          const drafts = savedPosts.filter(p => !published.some(pub => pub.id === p.id));
          combined = [...combined, ...drafts];
        }

        const sorted = sortBlogsByDate(combined);
        setPosts(sorted);
        const uniqueCategories = [...new Set(sorted.map(p => p.category).filter(Boolean))].sort();
        setCategories(uniqueCategories);
      } catch (error) {
        const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        const sorted = savedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sorted);
        setCategories([...new Set(sorted.map(p => p.category).filter(Boolean))].sort());
      } finally {
        setIsLoading(false);
      }
    };
    loadBlogs();
  }, [filterType, location]);

  useEffect(() => {
    const filtered = posts.filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Article Library</h1>
        <p className="text-gray-500 text-sm">Browse all health articles, wellness guides, and medical content.</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"
            disabled={isLoading}
          />
        </div>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-7 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 text-gray-700"
              disabled={isLoading}
            >
              <option value="">All Topics</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 text-gray-700"
            disabled={isLoading}
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <button
            onClick={exportLibraryHTML}
            disabled={isLoading || posts.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:text-teal-600 hover:border-teal-300 bg-gray-50 transition disabled:opacity-50"
          >
            <FileDown size={14} /> Export
          </button>
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="flex items-center gap-6 text-sm text-gray-500 flex-wrap">
          <span><strong className="text-gray-800">{posts.length}</strong> total</span>
          <span><strong className="text-gray-800">{publishedBlogs.length}</strong> published</span>
          <span><strong className="text-gray-800">{categories.length}</strong> topics</span>
          {filteredPosts.length !== posts.length && (
            <span className="text-teal-600 font-medium">{filteredPosts.length} matching</span>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600" />
        </div>
      )}

      {/* Articles Grid */}
      {!isLoading && (
        <>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map(post => {
                const avgRating = getAverageRating(post.id);
                const isPublished = publishedBlogs.some(p => p.id === post.id);
                return (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden flex flex-col group"
                  >
                    {/* Color header */}
                    <div className="h-2 bg-gradient-to-r from-teal-400 to-cyan-500" />
                    <div className="p-6 flex flex-col flex-1">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {post.category && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            <Tag size={10} /> {post.category}
                          </span>
                        )}
                        {isPublished && (
                          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            ✓ Published
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition mb-2 line-clamp-2">
                        {post.title}
                      </h3>

                      {post.metaDescription && (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
                          {post.metaDescription}
                        </p>
                      )}

                      {post.tags && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.split(',').slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-600">{post.author || 'Anonymous'}</span>
                          <span>·</span>
                          <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Clock size={11} /> {post.readingTime || 5}m
                          </span>
                          {avgRating && (
                            <span className="text-yellow-500 font-semibold">★ {avgRating}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <Search size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-base mb-1">
                {posts.length === 0 ? 'No articles published yet.' : 'No articles match your search.'}
              </p>
              {posts.length === 0 && (
                <Link to="/new" className="mt-4 inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition">
                  Write your first article
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlogLibrary;
