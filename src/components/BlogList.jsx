import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateBlogLibraryHTML } from '../utils/blogLibraryGenerator';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalWords: 0, totalReadTime: 0 });
  const location = useLocation();

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    const sortedPosts = savedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPosts(sortedPosts);

    setStats({
      total: sortedPosts.length,
      totalWords: sortedPosts.reduce((sum, p) => sum + (p.wordCount || 0), 0),
      totalReadTime: sortedPosts.reduce((sum, p) => sum + (p.readingTime || 0), 0)
    });
  }, [location]);

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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-900 text-white rounded-2xl p-12 shadow-2xl border border-teal-400/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold mb-3">Welcome to Your Health Blog Hub</h1>
            <p className="text-teal-50 text-lg max-w-xl">Share valuable health insights, wellness tips, and medical knowledge with your readers. Empower your community with evidence-based health information.</p>
          </div>
          <div className="text-6xl opacity-30">🏥</div>
        </div>
        <Link
          to="/new"
          className="inline-block bg-white text-teal-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 text-lg"
        >
          📝 Publish Health Article
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-teal-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Published Articles</p>
              <div className="text-4xl font-bold text-teal-600">{stats.total}</div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-emerald-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Words</p>
              <div className="text-4xl font-bold text-emerald-600">{stats.totalWords.toLocaleString()}</div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">📚</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-cyan-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Reading Time</p>
              <div className="text-4xl font-bold text-cyan-600">{stats.totalReadTime} <span className="text-lg text-gray-500">min</span></div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-7 shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-500 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Avg Words/Article</p>
              <div className="text-4xl font-bold text-blue-600">
                {stats.total > 0 ? Math.round(stats.totalWords / stats.total) : 0}
              </div>
            </div>
            <div className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity">📊</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/new"
          className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-center flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">✍️</span>
          <span>Write New Post</span>
        </Link>
        <Link
          to="/library"
          className="group bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-center flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">📚</span>
          <span>View Blog Library</span>
        </Link>
        <button
          onClick={exportLibraryHTML}
          disabled={posts.length === 0}
          className="group bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">📥</span>
          <span>Export as HTML</span>
        </button>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Recent Posts</h2>
          {posts.length > 0 && (
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
              {posts.length} total posts
            </span>
          )}
        </div>
        {posts.length > 0 ? (
          <div className="space-y-5">
            {posts.slice(0, 5).map((post, index) => {
              const avgRating = getAverageRating(post.id);
              return (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block bg-white p-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-blue-500 group hover:border-blue-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">#{index + 1}</span>
                        {post.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                            {post.category}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 ml-4">
                      {post.readingTime && (
                        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                          {post.readingTime} min
                        </span>
                      )}
                      {avgRating && (
                        <div className="text-center bg-yellow-50 px-3 py-1.5 rounded-lg">
                          <span className="text-yellow-500 font-bold text-lg">★</span>
                          <span className="text-xs text-yellow-700 font-semibold ml-1">{avgRating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 mb-3 flex-wrap gap-3">
                    {post.author && <span className="font-semibold text-gray-900">{post.author}</span>}
                    {post.author && <span className="text-gray-400">•</span>}
                    <time className="text-gray-500">{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">{post.wordCount || 0} words</span>
                  </div>
                  {post.metaDescription && (
                    <p className="text-gray-600 text-sm line-clamp-2">{post.metaDescription}</p>
                  )}
                </Link>
              );
            })}
            {posts.length > 5 && (
              <div className="text-center pt-6">
                <Link
                  to="/library"
                  className="inline-block text-blue-600 hover:text-blue-800 font-bold text-lg hover:underline transition"
                >
                  View all {posts.length} posts →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-16 text-center border-2 border-blue-200 border-dashed">
            <div className="text-6xl mb-4 opacity-50">📝</div>
            <p className="text-gray-700 text-lg mb-6 font-medium">No posts yet. Start creating your first blog post!</p>
            <Link
              to="/new"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              ✨ Create Your First Post
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">💡</span>
          <h3 className="text-2xl font-bold text-blue-900">Pro Tips for Success</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">📁</span>
            <p className="text-gray-700 font-medium">Use categories and tags to organize your content</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">🖼️</span>
            <p className="text-gray-700 font-medium">Add featured images to make posts more attractive</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">📝</span>
            <p className="text-gray-700 font-medium">Write descriptive meta descriptions for better SEO</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">💬</span>
            <p className="text-gray-700 font-medium">Enable reader comments to build community engagement</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">📚</span>
            <p className="text-gray-700 font-medium">Export your blog library as a standalone HTML index</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-blue-100">
            <span className="text-xl flex-shrink-0">📥</span>
            <p className="text-gray-700 font-medium">Download individual blog posts as HTML files</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogList;
