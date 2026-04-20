import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Pencil, Trash2, Star, Clock, BookOpen, Tag } from 'lucide-react';
import OptimizedMarkdownRenderer from './OptimizedMarkdownRenderer';
import { removeBlogFromManifest } from '../utils/blogManifest';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';
import { getImageMetadata, getImageData, deletePostImages } from '../utils/imageManager';
import { validateComment } from '../utils/validation';
import { blogAPI } from '../services/api';

function BlogDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [postImages, setPostImages] = useState({});
  const [notFound, setNotFound] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPost = async () => {
      let foundPost = null;

      // Try server first
      try {
        foundPost = await blogAPI.getPostById(id);
      } catch {
        // Fallback to localStorage
        const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
        foundPost = posts.find(p => p.id === Number(id)) || null;
      }

      if (!foundPost) {
        setNotFound(true);
        return;
      }

      setPost(foundPost);

      // Load images for this post
      const postId = foundPost._id || Number(id);
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
    const comment = { id: Date.now(), userName: userName.trim(), content: newComment.trim(), rating, date: new Date().toISOString() };
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    const postComments = [...(allComments[id] || []), comment];
    allComments[id] = postComments;
    localStorage.setItem('blog-comments', JSON.stringify(allComments));
    setComments(postComments);
    setNewComment('');
    setRating(0);
    setUserName('');
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    const postId = Number(id);
    const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    localStorage.setItem('blog-posts', JSON.stringify(posts.filter(p => p.id !== postId)));
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    delete allComments[id];
    localStorage.setItem('blog-comments', JSON.stringify(allComments));
    deletePostImages(postId);
    removeBlogFromManifest(postId);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-200 border-t-teal-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg mb-4">Article not found.</p>
        <Link to="/" className="inline-flex items-center gap-2 text-teal-600 hover:underline font-semibold">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-200 border-t-teal-600"></div>
      </div>
    );
  }

  const averageRating = comments.length > 0
    ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-600 transition font-medium">
          <ArrowLeft size={16} /> Back
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadBlogAsHTML(post)}
            className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-600 hover:text-teal-600 hover:border-teal-300 px-3 py-1.5 rounded-lg transition"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-gray-600 hover:text-teal-600 hover:border-teal-300 px-3 py-1.5 rounded-lg transition"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 text-sm bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded-lg transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
        {/* Meta badges */}
        <div className="flex items-center flex-wrap gap-2 mb-4">
          {post.category && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
              <Tag size={11} /> {post.category}
            </span>
          )}
          {post.tags && post.tags.split(',').slice(0, 3).map((tag, i) => (
            <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {tag.trim()}
            </span>
          ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author / date / stats row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 pb-6 mb-8 border-b border-gray-100">
          {post.author && (
            <span className="font-semibold text-gray-700">{post.author}</span>
          )}
          <time>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} /> {post.readingTime || 5} min read
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={13} /> {post.wordCount || 0} words
          </span>
          {averageRating && (
            <span className="inline-flex items-center gap-1 text-yellow-500 font-semibold">
              <Star size={13} fill="currentColor" /> {averageRating}
            </span>
          )}
        </div>

        {/* Content */}
        <OptimizedMarkdownRenderer content={post.content} postId={Number(id)} />
      </article>

      {/* Comments */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments <span className="text-gray-400 font-normal text-base">({comments.length})</span>
        </h2>

        {/* Add comment */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Leave a Comment</h3>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white"
            placeholder="Your name"
          />
          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl leading-none transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm bg-white"
            rows="3"
            placeholder="Share your thoughts..."
          />
          <button
            onClick={handleAddComment}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition"
          >
            Submit Comment
          </button>
        </div>

        {/* Comment list */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-gray-900 text-sm">{comment.userName}</span>
                  <time className="text-xs text-gray-400">
                    {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < comment.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default BlogDetail;
