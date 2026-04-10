import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { removeBlogFromManifest } from '../utils/blogManifest';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';
import { getImageMetadata, getImageData, deletePostImages } from '../utils/imageManager';
import { validateComment } from '../utils/validation';
import { blogAPI } from '../services/api';

function ReadProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
      <div
        className="h-full bg-gradient-to-r from-teal-500 to-cyan-600 transition-all duration-100"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      />
    </div>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-6 z-40 bg-gradient-to-r from-teal-600 to-cyan-700 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl hover:scale-110 transition-all duration-200"
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

function ShareButtons({ title, metaDescription }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: metaDescription, url });
      } catch {
        /* user cancelled */
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available */
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center flex-wrap gap-3">
      <span className="text-sm font-bold text-gray-700">Share:</span>
      {navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center space-x-1 bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <span>🔗</span><span>Share</span>
        </button>
      )}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1 bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-sky-600 transition"
      >
        <span>𝕏</span><span>Twitter</span>
      </a>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-1 bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-800 transition"
      >
        <span>in</span><span>LinkedIn</span>
      </a>
      <button
        onClick={handleCopy}
        className={`flex items-center space-x-1 text-xs font-bold px-4 py-2 rounded-lg transition ${copied ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
        <span>{copied ? '✓' : '📋'}</span><span>{copied ? 'Copied!' : 'Copy Link'}</span>
      </button>
    </div>
  );
}

function ClinicStreamsCTA() {
  return (
    <div className="bg-gradient-to-br from-teal-600 via-cyan-700 to-blue-800 rounded-2xl p-8 text-white shadow-xl my-10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">⚕️</span>
            <span className="text-xs font-bold uppercase tracking-widest text-teal-200">Powered by ClinicStreams</span>
          </div>
          <h3 className="text-2xl font-bold mb-2">Run a Smarter Clinic</h3>
          <p className="text-teal-100 text-sm leading-relaxed max-w-lg">
            ClinicStreams is the all-in-one healthcare management platform — patient scheduling, electronic health records, telemedicine, billing, and more. Trusted by clinics across the country.
          </p>
        </div>
        <div className="text-5xl opacity-20 hidden md:block">🏥</div>
      </div>
      <div className="flex flex-wrap gap-3 mt-6">
        <a
          href="https://clinicstreams.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-teal-700 font-bold px-6 py-3 rounded-xl text-sm hover:shadow-lg hover:bg-teal-50 transition-all duration-200"
        >
          Start Free Trial →
        </a>
        <a
          href="https://clinicstreams.com/features"
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white/50 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-all duration-200"
        >
          See All Features
        </a>
      </div>
    </div>
  );
}

function RelatedArticles({ currentPost, allPosts }) {
  const related = allPosts
    .filter(p => p.id !== currentPost.id)
    .filter(p =>
      (p.category && p.category === currentPost.category) ||
      (p.tags && currentPost.tags && p.tags.split(',').some(tag =>
        currentPost.tags.split(',').map(t => t.trim().toLowerCase()).includes(tag.trim().toLowerCase())
      ))
    )
    .slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 my-8">
      <div className="flex items-center space-x-3 mb-6">
        <span className="text-2xl">📚</span>
        <h2 className="text-2xl font-bold text-gray-900">Related Articles</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map(post => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="group block bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 rounded-xl p-5 hover:shadow-md hover:border-teal-300 transition-all duration-200"
          >
            {post.category && (
              <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full mb-3">
                {post.category}
              </span>
            )}
            <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-teal-700 transition line-clamp-3 mb-2">
              {post.title}
            </h3>
            <p className="text-xs text-gray-500">{post.readingTime || 5} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-8 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-24 mb-8" />
      <div className="bg-white rounded-2xl shadow-lg p-10 mb-10">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-6" />
        <div className="flex gap-4 mb-10 pb-8 border-b border-gray-100">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-8 bg-gray-200 rounded-lg w-24" />)}
        </div>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-4 bg-gray-200 rounded mb-3" style={{ width: `${85 + (i % 3) * 5}%` }} />
        ))}
      </div>
    </div>
  );
}

function BlogDetail() {
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [postImages, setPostImages] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      setIsLoading(true);
      setNotFound(false);

      try {
        // Try server API first
        const serverPost = await blogAPI.getPostById(id);
        setPost(serverPost);
      } catch {
        // Fallback to localStorage
        const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        const foundPost = posts.find(p => p.id === Number(id) || p._id === id || String(p.id) === id);
        if (foundPost) {
          setPost(foundPost);
        } else {
          setNotFound(true);
        }
      } finally {
        setIsLoading(false);
      }

      // Load related posts for sidebar
      try {
        const response = await blogAPI.getAllPosts(20);
        setAllPosts(response.posts || []);
      } catch {
        const saved = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        setAllPosts(saved);
      }

      // Load images
      const imageMetadata = getImageMetadata(Number(id)) || [];
      const images = {};
      imageMetadata.forEach(img => {
        const dataUrl = getImageData(img.id);
        images[img.id] = { ...img, dataUrl };
      });
      setPostImages(images);

      // Load comments
      const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
      setComments(allComments[id] || []);
    };

    loadPost();
  }, [id]);

  const handleAddComment = () => {
    const validation = validateComment({ userName, content: newComment, rating });

    if (!validation.isValid) {
      alert(`Please fix the following:\n\n${Object.values(validation.errors).join('\n')}`);
      return;
    }

    const comment = {
      id: Date.now(),
      userName: userName.trim(),
      content: newComment.trim(),
      rating,
      date: new Date().toISOString()
    };

    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    const postComments = [...(allComments[id] || []), comment];
    allComments[id] = postComments;
    localStorage.setItem('blog-comments', JSON.stringify(allComments));
    setComments(postComments);
    setNewComment('');
    setRating(0);
    // Keep userName so the same user can post follow-up comments easily
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const postId = Number(id);

      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      localStorage.setItem('blog-posts', JSON.stringify(posts.filter(p => p.id !== postId)));

      const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
      delete allComments[id];
      localStorage.setItem('blog-comments', JSON.stringify(allComments));

      deletePostImages(postId);
      removeBlogFromManifest(postId);

      // Also delete from server if available
      blogAPI.deletePost(id).catch(() => {});

      navigate('/');
    }
  };

  const StarRating = ({ value, onChange }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${star <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
          aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (isLoading) return <PostSkeleton />;

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 p-12 rounded-2xl border-2 border-teal-200 border-dashed max-w-md">
          <div className="text-6xl mb-4 opacity-40">📋</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Article Not Found</h2>
          <p className="text-gray-600 mb-6">This health article doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = comments.length > 0
    ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
    : null;

  return (
    <>
      <ReadProgressBar />
      <BackToTopButton />

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Top nav bar */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Link to="/" className="group flex items-center space-x-2 text-teal-600 hover:text-teal-800 font-bold text-base transition">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={() => downloadBlogAsHTML(post)}
              className="flex items-center space-x-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:shadow-lg font-bold transition-all duration-200 text-sm"
            >
              <span>📥</span><span>Download</span>
            </button>
            <button
              onClick={() => navigate(`/edit/${id}`)}
              className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-4 py-2 rounded-lg hover:shadow-lg font-bold transition-all duration-200 text-sm"
            >
              <span>✏️</span><span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:shadow-lg font-bold transition-all duration-200 text-sm"
            >
              <span>🗑️</span><span>Delete</span>
            </button>
          </div>
        </div>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-lg p-6 md:p-10 mb-8 border border-gray-200 hover:shadow-xl transition-shadow">
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 object-cover rounded-xl mb-8"
              loading="eager"
            />
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 leading-tight">{post.title}</h1>

          <div className="flex items-center flex-wrap gap-3 mb-8 pb-8 border-b border-gray-200">
            {post.author && (
              <div className="flex items-center space-x-1 bg-gray-100 px-4 py-2 rounded-lg">
                <span className="text-gray-500 text-sm">By</span>
                <span className="font-bold text-gray-900 text-sm">{post.author}</span>
              </div>
            )}
            <time className="text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-lg text-sm">
              {new Date(post.date || post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <div className="bg-teal-100 px-4 py-2 rounded-lg">
              <span className="text-teal-700 font-medium text-sm">{post.readingTime || 5} min read</span>
            </div>
            <div className="bg-cyan-100 px-4 py-2 rounded-lg">
              <span className="text-cyan-700 font-medium text-sm">{post.wordCount || 0} words</span>
            </div>
            {averageRating && (
              <div className="flex items-center space-x-1 bg-yellow-100 px-4 py-2 rounded-lg">
                <span className="text-yellow-600 font-bold">★</span>
                <span className="text-yellow-700 font-bold text-sm">{averageRating}</span>
                <span className="text-yellow-600 text-xs">({comments.length})</span>
              </div>
            )}
            {post.category && (
              <span className="bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                {post.category}
              </span>
            )}
          </div>

          {post.metaDescription && (
            <p className="text-lg text-gray-600 leading-relaxed mb-8 italic border-l-4 border-teal-400 pl-4 bg-teal-50 py-3 rounded-r-lg">
              {post.metaDescription}
            </p>
          )}

          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-teal-600">
            <ReactMarkdown
              components={{
                img: ({ src, alt, ...props }) => {
                  const imageData = postImages[src];
                  const imageSrc = imageData?.dataUrl || src;
                  return (
                    <img
                      src={imageSrc}
                      alt={alt}
                      {...props}
                      className="max-w-full h-auto rounded-xl shadow-md my-6"
                      loading="lazy"
                      decoding="async"
                    />
                  );
                }
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {post.tags.split(',').map((tag, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <ShareButtons title={post.title} metaDescription={post.metaDescription} />
          </div>
        </article>

        {/* ClinicStreams CTA */}
        <ClinicStreamsCTA />

        {/* Related Articles */}
        <RelatedArticles currentPost={post} allPosts={allPosts} />

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10 border border-gray-200">
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-3xl">💬</span>
            <h2 className="text-2xl font-bold">Comments <span className="text-base text-gray-500 font-normal">({comments.length})</span></h2>
          </div>

          {/* Comment Form */}
          <div className="mb-8 bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center space-x-2">
              <span>✍️</span><span>Share Your Thoughts</span>
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name *</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 font-medium"
                placeholder="Enter your name"
                maxLength={100}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Article Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment *</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-400 font-medium"
                rows="4"
                placeholder="Share your experience or feedback..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">{newComment.length}/2000</p>
            </div>
            <button
              onClick={handleAddComment}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:from-teal-700 hover:to-cyan-800 transition-all duration-200"
            >
              Submit Comment
            </button>
          </div>

          {/* Comment List */}
          <div className="space-y-5">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded-full text-sm">{comment.userName}</span>
                    <time className="text-gray-500 text-xs">
                      {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-lg ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 border-dashed">
                <div className="text-4xl mb-3 opacity-40">💭</div>
                <p className="text-gray-600 font-medium">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default BlogDetail;
