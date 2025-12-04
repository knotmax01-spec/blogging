import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import OptimizedMarkdownRenderer from './OptimizedMarkdownRenderer';
import { removeBlogFromManifest } from '../utils/blogManifest';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';
import { getImageMetadata, getImageData, deletePostImages } from '../utils/imageManager';
import { validateComment } from '../utils/validation';

function BlogDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userName, setUserName] = useState('');
  const [postImages, setPostImages] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    const foundPost = posts.find(p => p.id === Number(id));
    setPost(foundPost);

    // Load images for this post using new imageManager
    const imageMetadata = getImageMetadata(Number(id)) || [];
    const images = {};
    imageMetadata.forEach(img => {
      const dataUrl = getImageData(img.id);
      images[img.id] = {
        ...img,
        dataUrl
      };
    });
    setPostImages(images);

    // Load comments
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    setComments(allComments[id] || []);
  }, [id]);

  const handleAddComment = () => {
    const validation = validateComment({
      userName,
      content: newComment,
      rating
    });

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      alert(`Please fix the following:\n\n${errorMessages}`);
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
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      const postId = Number(id);

      // Delete post from localStorage
      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      const updatedPosts = posts.filter(p => p.id !== postId);
      localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));

      // Delete associated comments
      const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
      delete allComments[id];
      localStorage.setItem('blog-comments', JSON.stringify(allComments));

      // Delete associated images using new imageManager
      deletePostImages(postId);

      // Remove from manifest
      removeBlogFromManifest(postId);

      alert('Post and all associated images deleted successfully');
      navigate('/');
    }
  };

  const StarRating = ({ value, onChange }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-teal-50 to-cyan-50 p-12 rounded-2xl border-2 border-teal-200 border-dashed">
          <div className="text-6xl mb-4 opacity-40">📋</div>
          <p className="text-gray-700 text-lg font-medium mb-6">Health article not found</p>
          <Link to="/" className="inline-block bg-gradient-to-r from-teal-600 to-cyan-700 text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-200">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = comments.length > 0
    ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
        <Link to="/" className="group flex items-center space-x-2 text-teal-600 hover:text-teal-800 font-bold text-lg transition">
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          <span>Back</span>
        </Link>
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={() => downloadBlogAsHTML(post)}
            className="group flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:from-emerald-600 hover:to-teal-700 font-bold transition-all duration-200"
          >
            <span>📥</span>
            <span>Download</span>
          </button>
          <button
            onClick={handleEdit}
            className="group flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:from-teal-600 hover:to-cyan-700 font-bold transition-all duration-200"
          >
            <span>✏️</span>
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="group flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:from-red-600 hover:to-red-700 font-bold transition-all duration-200"
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>
      <article className="bg-white rounded-2xl shadow-lg p-10 mb-10 border border-gray-200 hover:shadow-xl transition-shadow">
        <h1 className="text-5xl font-bold mb-6 text-gray-900 leading-tight">{post.title}</h1>
        <div className="flex items-center flex-wrap gap-4 mb-10 pb-8 border-b border-gray-200">
          <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-gray-700">By</span>
            <span className="font-bold text-gray-900">{post.author || 'Anonymous'}</span>
          </div>
          <time className="text-gray-600 font-medium bg-gray-100 px-4 py-2 rounded-lg">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <div className="flex items-center space-x-1 bg-blue-100 px-4 py-2 rounded-lg">
            <span className="text-blue-700 font-medium">{post.readingTime || 5} min read</span>
          </div>
          <div className="flex items-center space-x-1 bg-purple-100 px-4 py-2 rounded-lg">
            <span className="text-purple-700 font-medium">{post.wordCount || 0} words</span>
          </div>
          {averageRating !== 'No ratings yet' && (
            <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-lg">
              <span className="text-yellow-600 font-bold text-lg">★</span>
              <span className="text-yellow-700 font-bold">{averageRating}</span>
            </div>
          )}
          {post.category && (
            <span className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full">
              {post.category}
            </span>
          )}
        </div>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              img: ({src, alt, ...props}) => {
                const imageData = postImages[src];
                const imageSrc = imageData?.dataUrl || src;
                return (
                  <img
                    src={imageSrc}
                    alt={alt}
                    {...props}
                    className="max-w-full h-auto rounded-lg shadow-md"
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
      </article>

      <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-200">
        <div className="flex items-center space-x-3 mb-10">
          <span className="text-3xl">💬</span>
          <h2 className="text-3xl font-bold">Comments <span className="text-lg text-gray-500">({comments.length})</span></h2>
        </div>

        <div className="mb-10 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <span>✍️</span>
            <span>Leave a Comment</span>
          </h3>
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-medium"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Your Comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 font-medium"
              rows="4"
              placeholder="Share your thoughts..."
            />
          </div>
          <button
            onClick={handleAddComment}
            className="group w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          >
            Submit Comment
          </button>
        </div>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="font-bold text-lg text-gray-900 bg-gray-200 px-4 py-1.5 rounded-full">{comment.userName}</span>
                  <time className="text-gray-600 text-sm font-medium">
                    {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xl ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed text-base">{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-gray-200 border-dashed">
              <div className="text-5xl mb-3 opacity-40">💭</div>
              <p className="text-gray-600 text-lg font-medium">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
