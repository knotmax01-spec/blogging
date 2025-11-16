import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function BlogDetail() {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const [userName, setUserName] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    const foundPost = posts.find(p => p.id === Number(id));
    setPost(foundPost);

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
    if (window.confirm('Are you sure you want to delete this post?')) {
      const posts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
      const updatedPosts = posts.filter(p => p.id !== Number(id));
      localStorage.setItem('blog-posts', JSON.stringify(updatedPosts));
      
      // Delete associated comments
      const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
      delete allComments[id];
      localStorage.setItem('blog-comments', JSON.stringify(allComments));
      
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
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to posts
        </Link>
        <div className="space-x-4">
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Edit Post
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Post
          </button>
        </div>
      </div>
      <article className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center mb-8">
          <time className="text-gray-500">
            {new Date(post.date).toLocaleDateString()}
          </time>
          <span className="mx-4 text-gray-300">|</span>
          <span className="text-yellow-400 font-bold">★ {averageRating}</span>
        </div>
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              img: ({node, ...props}) => (
                <img {...props} className="max-w-full h-auto rounded-lg" />
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        <div className="mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="Write your comment..."
            />
          </div>
          <button
            onClick={handleAddComment}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </div>

        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{comment.userName}</span>
                <time className="text-gray-500 text-sm">
                  {new Date(comment.date).toLocaleDateString()}
                </time>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetail;