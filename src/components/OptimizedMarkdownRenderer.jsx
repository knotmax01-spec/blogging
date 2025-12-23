import ReactMarkdown from 'react-markdown';
import { getImageData, getImageMetadata } from '../utils/imageManager';

/**
 * Custom image component that handles both IDs and URLs
 */
function ImageComponent({ src, alt, postId }) {
  // Check if src is an image ID (numeric) or a URL
  const isImageId = /^\d+$/.test(src);
  
  if (isImageId && postId) {
    // Load image from localStorage
    const imageData = getImageData(src);
    if (imageData) {
      return (
        <img
          src={imageData}
          alt={alt || 'Blog image'}
          className="w-full h-auto rounded-lg shadow-md my-4"
          loading="lazy"
        />
      );
    }
  }
  
  // Handle external URLs or fallback
  return (
    <img
      src={src}
      alt={alt || 'Blog image'}
      className="w-full h-auto rounded-lg shadow-md my-4"
      loading="lazy"
      decoding="async"
      onError={(e) => {
        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="16" fill="%239ca3af"%3EImage not found%3C/text%3E%3C/svg%3E';
      }}
    />
  );
}

/**
 * Optimized Markdown Renderer with image support
 */
function OptimizedMarkdownRenderer({ content, postId, className = '' }) {
  const handleImageClick = (src) => {
    // Open image in lightbox or new tab
    if (!(/^\d+$/.test(src))) {
      window.open(src, '_blank');
    }
  };

  return (
    <ReactMarkdown
      className={`prose prose-lg max-w-none ${className}`}
      components={{
        img: ({ src, alt }) => (
          <div
            className="cursor-pointer"
            onClick={() => handleImageClick(src)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleImageClick(src);
              }
            }}
          >
            <ImageComponent src={src} alt={alt} postId={postId} />
          </div>
        ),
        h1: ({ children }) => (
          <h1 className="text-4xl font-bold mb-4 mt-6 text-gray-900">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-3xl font-bold mb-3 mt-5 text-gray-900">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-2xl font-bold mb-2 mt-4 text-gray-900">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-700 leading-relaxed mb-4">
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-gray-700">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-600 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50 rounded-r">
            {children}
          </blockquote>
        ),
        code: ({ inline, children }) => 
          inline ? (
            <code className="bg-gray-100 text-red-600 px-2 py-1 rounded text-sm font-mono">
              {children}
            </code>
          ) : (
            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
            {children}
          </pre>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="w-full border-collapse border border-gray-300">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-300 px-4 py-2">
            {children}
          </td>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline font-semibold"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default OptimizedMarkdownRenderer;
