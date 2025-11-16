import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { removeBlogFromManifest } from '../utils/blogManifest';
import { downloadBlogAsHTML } from '../utils/staticSiteExporter';

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

    // Load images for this post
    const allImages = JSON.parse(localStorage.getItem('blog-images') || '{}');
    const images = allImages[Number(id)] || {};
    setPostImages(images);

    // Load comments
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    setComments(allComments[id] || []);
  }, [id]);

  const handleAddComment = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    const comment = {
      id: Date.now(),
      userName,
      content: newComment,
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
      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      const updatedPosts = posts.filter(p => p.id !== Number(id));
      localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));

      // Delete associated comments
      const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
      delete allComments[id];
      localStorage.setItem('blog-comments', JSON.stringify(allComments));

      // Remove from manifest
      removeBlogFromManifest(Number(id));

      alert('Post deleted successfully');
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
      <div className="text-center py-8">
        <p className="text-gray-500">Post not found</p>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to posts
        </Link>
      </div>
    );
  }

  const averageRating = comments.length > 0
    ? (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1">
          <span>←</span>
          <span>Back to Dashboard</span>
        </Link>
        <div className="space-x-3 flex flex-wrap gap-2">
          <button
            onClick={() => downloadBlogAsHTML(post)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold transition"
          >
            📥 Download HTML
          </button>
          <button
            onClick={handleEdit}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            ✏️ Edit Post
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
      <article className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
        <div className="flex items-center text-gray-600 mb-8 pb-6 border-b flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">By</span>
            <span className="font-semibold text-gray-900">{post.author || 'Anonymous'}</span>
          </div>
          <span>•</span>
          <time className="text-sm">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
          <span>•</span>
          <span className="text-sm">{post.readingTime || 5} min read</span>
          <span>•</span>
          <span className="text-sm">{post.wordCount} words</span>
          <span>•</span>
          <span className="text-yellow-400 font-bold">★ {averageRating}</span>
          {post.category && (
            <>
              <span>•</span>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
                {post.category}
              </span>
            </>
          )}
        </div>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              img: ({src, alt, ...props}) => {
                const imageSrc = postImages[src] || src;
                return (
                  <img
                    src={imageSrc}
                    alt={alt}
                    {...props}
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-8 border-b pb-4">💬 Comments ({comments.length})</h2>

        <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="font-bold text-gray-900 mb-4">Leave a Comment</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Comment
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Write your comment..."
            />
          </div>
          <button
            onClick={handleAddComment}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold transition"
          >
            Submit Comment
          </button>
        </div>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <span className="font-bold text-gray-900">{comment.userName}</span>
                  <time className="text-gray-500 text-sm">
                    {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;
