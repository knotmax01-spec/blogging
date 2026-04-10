import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { generateBlogLibraryHTML } from '../utils/blogLibraryGenerator';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';
import { blogAPI } from '../services/api';

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalWords: 0, totalReadTime: 0 });
  const location = useLocation();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Load from server
        const response = await blogAPI.getAllPosts(100);
        const serverPosts = response.posts || [];
        const sortedPosts = serverPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);

        setStats({
          total: sortedPosts.length,
          totalWords: sortedPosts.reduce((sum, p) => sum + (p.wordCount || 0), 0),
          totalReadTime: sortedPosts.reduce((sum, p) => sum + (p.readingTime || 0), 0)
        });
      } catch (error) {
        console.warn('Could not load posts from server, using localStorage:', error.message);
        // Fallback to localStorage
        const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        const sortedPosts = savedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);

        setStats({
          total: sortedPosts.length,
          totalWords: sortedPosts.reduce((sum, p) => sum + (p.wordCount || 0), 0),
          totalReadTime: sortedPosts.reduce((sum, p) => sum + (p.readingTime || 0), 0)
        });
      }
    };

    loadPosts();
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
      <div className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-900 text-white rounded-2xl p-10 md:p-12 shadow-2xl border border-teal-400/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-200 bg-teal-700/50 px-3 py-1 rounded-full">ClinicStreams Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Healthcare Insights & Wellness</h1>
            <p className="text-teal-50 text-lg max-w-xl">Evidence-based health articles, clinical tips, and wellness insights for providers and patients. Powered by ClinicStreams.</p>
          </div>
          <div className="text-6xl opacity-20 hidden md:block">🏥</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/new"
            className="inline-block bg-white text-teal-700 px-8 py-3 rounded-lg font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            📝 Publish Article
          </Link>
          <a
            href="https://clinicstreams.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-white/50 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-200"
          >
            🏥 Visit ClinicStreams →
          </a>
        </div>
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
          className="group bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-center flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">📝</span>
          <span>Write Health Article</span>
        </Link>
        <Link
          to="/library"
          className="group bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 text-center flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">📚</span>
          <span>Browse Articles</span>
        </Link>
        <button
          onClick={exportLibraryHTML}
          disabled={posts.length === 0}
          className="group bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-4 rounded-xl font-bold hover:shadow-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <span className="group-hover:scale-110 transition-transform">📥</span>
          <span>Export as HTML</span>
        </button>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl font-bold">Latest Health Articles</h2>
          {posts.length > 0 && (
            <span className="text-sm font-medium text-teal-700 bg-teal-100 px-4 py-2 rounded-full">
              {posts.length} published articles
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
                  className="block bg-white p-7 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-teal-500 group hover:border-teal-600"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">#{index + 1}</span>
                        {post.category && (
                          <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
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
                  className="inline-block text-teal-600 hover:text-teal-800 font-bold text-lg hover:underline transition"
                >
                  View all {posts.length} articles →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-16 text-center border-2 border-teal-200 border-dashed">
            <div className="text-6xl mb-4 opacity-50">🏥</div>
            <p className="text-gray-700 text-lg mb-6 font-medium">No health articles yet. Share your wellness insights with your community!</p>
            <Link
              to="/new"
              className="inline-block bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              📝 Publish Your First Article
            </Link>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <span className="text-3xl">💡</span>
          <h3 className="text-2xl font-bold text-teal-900">Health Content Best Practices</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">🏥</span>
            <p className="text-gray-700 font-medium">Organize articles by health categories (Wellness, Nutrition, Mental Health, etc.)</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">✓</span>
            <p className="text-gray-700 font-medium">Cite medical sources and evidence-based information</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">📋</span>
            <p className="text-gray-700 font-medium">Use clear tags for easy health topic discovery</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">💬</span>
            <p className="text-gray-700 font-medium">Engage readers with health discussions and wellness tips</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">📊</span>
            <p className="text-gray-700 font-medium">Share comprehensive guides on health and wellness topics</p>
          </div>
          <div className="flex items-start space-x-3 bg-white p-4 rounded-lg border border-teal-100">
            <span className="text-xl flex-shrink-0">📥</span>
            <p className="text-gray-700 font-medium">Export your health knowledge base as a reference site</p>
          </div>
        </div>
      </div>

      {/* ClinicStreams Value Proposition */}
      <div className="bg-gradient-to-br from-teal-700 via-cyan-700 to-blue-800 rounded-2xl p-10 text-white shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-200">Powered by ClinicStreams</span>
          <h2 className="text-3xl font-bold mt-2 mb-3">The Complete Healthcare Management Platform</h2>
          <p className="text-teal-100 max-w-2xl mx-auto">Join thousands of healthcare providers who use ClinicStreams to streamline patient care, reduce admin overhead, and grow their practice.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '📅', title: 'Smart Scheduling', desc: 'Online booking with automated reminders' },
            { icon: '🩺', title: 'Electronic Health Records', desc: 'HIPAA-compliant digital records' },
            { icon: '💻', title: 'Telemedicine', desc: 'Video consultations from anywhere' },
            { icon: '💳', title: 'Billing & Payments', desc: 'Automated invoicing and insurance claims' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/10 backdrop-blur rounded-xl p-5 border border-white/20 hover:bg-white/20 transition">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold text-white mb-1 text-sm">{title}</h3>
              <p className="text-teal-100 text-xs">{desc}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://clinicstreams.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-teal-700 font-bold px-8 py-3 rounded-xl hover:shadow-xl hover:bg-teal-50 transition-all duration-200"
          >
            Start Free Trial →
          </a>
          <a
            href="https://clinicstreams.com/demo"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-white/50 text-white font-bold px-8 py-3 rounded-xl hover:bg-white/10 transition-all duration-200"
          >
            Book a Demo
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogList;
