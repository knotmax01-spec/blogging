import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

function BlogList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('blog-posts') || '[]');
    setPosts(savedPosts);
  }, []);

  const getAverageRating = (postId) => {
    const allComments = JSON.parse(localStorage.getItem('blog-comments') || '{}');
    const comments = allComments[postId] || [];
    if (comments.length === 0) return null;
    return (comments.reduce((acc, curr) => acc + curr.rating, 0) / comments.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Blog Posts</h1>
      {posts.map(post => {
        const avgRating = getAverageRating(post.id);
        return (
          <Link 
            key={post.id} 
            to={`/post/${post.id}`}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{post.title}</h2>
              <div className="flex items-center space-x-2">
                {post.readingTime && (
                  <span className="text-sm text-gray-500">{post.readingTime} min read</span>
                )}
                {avgRating && (
                  <span className="text-yellow-400 font-bold">★ {avgRating}</span>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              {post.author && <span>By {post.author}</span>}
              {post.author && <span className="mx-2">•</span>}
              <span>{new Date(post.date).toLocaleDateString()}</span>
              {post.category && (
                <>
                  <span className="mx-2">•</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {post.category}
                  </span>
                </>
              )}
            </div>
            {post.metaDescription && (
              <p className="text-gray-600 mb-4">{post.metaDescription}</p>
            )}
            <div className="prose prose-sm line-clamp-3">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </Link>
        );
      })}
      {posts.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No posts yet. Create your first post!
        </p>
      )}
    </div>
  );
}

export default BlogList;