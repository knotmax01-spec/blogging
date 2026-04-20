import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenSquare, BookOpen, FileDown, Clock, FileText, BarChart2, Hash } from 'lucide-react';
import { generateBlogLibraryHTML } from '../utils/blogLibraryGenerator';
import { blogAPI } from '../services/api';

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, totalWords: 0, totalReadTime: 0 });
  const location = useLocation();

  useEffect(() => {
    const loadPosts = async () => {
      try {
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
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white rounded-2xl p-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Your Health Blog</h1>
          <p className="text-teal-100 text-base max-w-lg">
            Share evidence-based health insights and wellness tips with your community.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/new"
              className="inline-flex items-center gap-2 bg-white text-teal-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition text-sm"
            >
              <PenSquare size={15} />
              Write Article
            </Link>
            <Link
              to="/library"
              className="inline-flex items-center gap-2 border border-white/50 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-white/10 transition text-sm"
            >
              <BookOpen size={15} />
              Browse Library
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex text-[7rem] leading-none opacity-20 select-none">✚</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-teal-100 text-teal-600 rounded-lg p-2.5"><FileText size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Articles</p>
            <p className="text-2xl font-bold text-teal-600">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-600 rounded-lg p-2.5"><Hash size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Total Words</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.totalWords.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-cyan-100 text-cyan-600 rounded-lg p-2.5"><Clock size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Read Time</p>
            <p className="text-2xl font-bold text-cyan-600">{stats.totalReadTime} min</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 rounded-lg p-2.5"><BarChart2 size={20} /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Avg Words</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.total > 0 ? Math.round(stats.totalWords / stats.total).toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Latest Articles</h2>
          <div className="flex items-center gap-3">
            {posts.length > 0 && (
              <button
                onClick={exportLibraryHTML}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition"
              >
                <FileDown size={15} />
                Export HTML
              </button>
            )}
            {posts.length > 5 && (
              <Link to="/library" className="text-sm text-teal-600 hover:underline font-medium">
                View all →
              </Link>
            )}
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.slice(0, 8).map((post, index) => {
              const avgRating = getAverageRating(post.id);
              return (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="flex items-start gap-5 bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.category && (
                        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-teal-700 transition line-clamp-1">
                      {post.title}
                    </h3>
                    {post.metaDescription && (
                      <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{post.metaDescription}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                      {post.author && <span className="font-medium text-gray-600">{post.author}</span>}
                      <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {post.readingTime && <span>{post.readingTime} min read</span>}
                      {avgRating && (
                        <span className="text-yellow-500 font-semibold">★ {avgRating}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4 text-gray-300">✚</div>
            <p className="text-gray-500 text-base mb-5">No articles yet. Start sharing your health insights!</p>
            <Link
              to="/new"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg font-semibold transition text-sm"
            >
              <PenSquare size={15} />
              Write Your First Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default BlogList;

