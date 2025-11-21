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
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Welcome to Your Blog Dashboard</h1>
        <p className="text-blue-100 text-lg mb-6">Manage, create, and publish your blog posts with ease</p>
        <Link
          to="/new"
          className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          ✨ Create New Post
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 shadow border-l-4 border-blue-500">
          <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          <p className="text-gray-600 text-sm mt-2">Published Posts</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border-l-4 border-green-500">
          <div className="text-3xl font-bold text-green-600">{stats.totalWords.toLocaleString()}</div>
          <p className="text-gray-600 text-sm mt-2">Total Words</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border-l-4 border-orange-500">
          <div className="text-3xl font-bold text-orange-600">{stats.totalReadTime}</div>
          <p className="text-gray-600 text-sm mt-2">Total Read Time (min)</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border-l-4 border-purple-500">
          <div className="text-3xl font-bold text-purple-600">
            {stats.total > 0 ? Math.round(stats.totalWords / stats.total) : 0}
          </div>
          <p className="text-gray-600 text-sm mt-2">Avg Words per Post</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <Link
          to="/new"
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
        >
          ✍️ Write New Post
        </Link>
        <Link
          to="/library"
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
        >
          📚 View Blog Library
        </Link>
        <button
          onClick={exportLibraryHTML}
          disabled={posts.length === 0}
          className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 Export as HTML
        </button>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Recent Posts</h2>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.slice(0, 5).map(post => {
              const avgRating = getAverageRating(post.id);
              return (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-blue-500 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                      {post.title}
                    </h3>
                    <div className="flex items-center space-x-3">
                      {post.readingTime && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {post.readingTime} min read
                        </span>
                      )}
                      {avgRating && (
                        <span className="text-yellow-400 font-bold text-lg">★ {avgRating}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-3 flex-wrap gap-2">
                    {post.author && <span className="font-medium">{post.author}</span>}
                    {post.author && <span>•</span>}
                    <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                    {post.category && (
                      <>
                        <span>•</span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{post.wordCount} words</span>
                  </div>
                  {post.metaDescription && (
                    <p className="text-gray-600 line-clamp-2">{post.metaDescription}</p>
                  )}
                </Link>
              );
            })}
            {posts.length > 5 && (
              <div className="text-center pt-4">
                <Link
                  to="/library"
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View all {posts.length} posts →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center shadow">
            <p className="text-gray-500 text-lg mb-4">No posts yet. Start creating your first blog post!</p>
            <Link
              to="/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              ✨ Create Your First Post
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">💡 Pro Tips</h3>
        <ul className="space-y-2 text-gray-700">
          <li>• Use categories and tags to organize your content</li>
          <li>• Add featured images to make your posts more attractive</li>
          <li>• Write descriptive meta descriptions for better SEO</li>
          <li>• Enable reader comments to build community engagement</li>
          <li>• Export your blog library as a standalone HTML index page</li>
          <li>• Download individual blog posts as HTML files for static hosting</li>
        </ul>
      </div>
    </div>
  );
}

export default BlogList;
