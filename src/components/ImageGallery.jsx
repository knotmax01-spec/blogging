import { useState, useCallback } from 'react';
import { Trash2, Copy, ZoomIn } from 'lucide-react';
import { deleteImageMetadata, formatFileSize } from '../utils/imageManager';

function ImageGallery({ images, postId, onImageDelete, onImageSelect }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleDeleteImage = useCallback((imageId) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      if (postId) {
        deleteImageMetadata(postId, imageId);
      }
      if (onImageDelete) {
        onImageDelete(imageId);
      }
      if (selectedImage?.id === imageId) {
        setSelectedImage(null);
      }
    }
  }, [postId, selectedImage, onImageDelete]);

  const handleCopyMarkdown = useCallback((image) => {
    const markdown = `![${image.originalName}](${image.id})`;
    navigator.clipboard.writeText(markdown);
    alert('Markdown copied to clipboard!');
  }, []);

  const handleCopyPath = useCallback((image) => {
    const path = `/blog-images/inline/${image.filename}`;
    navigator.clipboard.writeText(path);
    alert('Image path copied to clipboard!');
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No images uploaded yet</p>
        <p className="text-gray-400 text-sm mt-2">Drag and drop or click to upload images</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedImage(image);
              setShowPreview(true);
            }}
          >
            {/* Image Thumbnail */}
            <div className="relative w-full h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
              {image.dataUrl ? (
                <img
                  src={image.dataUrl}
                  alt={image.originalName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="text-3xl mb-1">🖼️</div>
                  <div className="text-xs">No preview</div>
                </div>
              )}
            </div>

            {/* Image Info */}
            <div className="p-3 space-y-2">
              <p className="text-xs font-medium text-gray-900 truncate" title={image.originalName}>
                {image.originalName}
              </p>
              <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
              <p className="text-xs text-gray-400">{image.width}×{image.height}px</p>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(image);
                    setShowPreview(true);
                  }}
                  className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 p-1 rounded transition"
                  title="Preview image"
                >
                  <ZoomIn size={14} className="mx-auto" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 p-1 rounded transition"
                  title="Delete image"
                >
                  <Trash2 size={14} className="mx-auto" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreview && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{selectedImage.originalName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {/* Preview Image */}
              {selectedImage.dataUrl && (
                <img
                  src={selectedImage.dataUrl}
                  alt={selectedImage.originalName}
                  className="w-full h-auto rounded-lg border"
                />
              )}

              {/* Image Details */}
              <div className="mt-6 space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Filename</p>
                  <p className="text-gray-900 font-mono text-xs break-all">{selectedImage.filename}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Size</p>
                    <p className="text-gray-900">{formatFileSize(selectedImage.size)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Dimensions</p>
                    <p className="text-gray-900">{selectedImage.width}×{selectedImage.height}px</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600">Uploaded</p>
                  <p className="text-gray-900 text-xs">
                    {new Date(selectedImage.uploadedAt).toLocaleString()}
                  </p>
                </div>

                {selectedImage.alt && (
                  <div>
                    <p className="text-gray-600">Alt Text</p>
                    <p className="text-gray-900">{selectedImage.alt}</p>
                  </div>
                )}

                {/* Usage Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-900 font-semibold mb-2">Usage</p>
                  <p className="text-blue-800 text-xs mb-3">
                    Click buttons below to copy the code for inserting this image into your blog content:
                  </p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleCopyMarkdown(selectedImage)}
                      className="w-full text-left text-xs bg-white border border-blue-300 text-blue-600 p-2 rounded hover:bg-blue-50 transition flex justify-between items-center"
                    >
                      <span className="font-mono">Markdown format</span>
                      <Copy size={14} />
                    </button>

                    <button
                      onClick={() => handleCopyPath(selectedImage)}
                      className="w-full text-left text-xs bg-white border border-blue-300 text-blue-600 p-2 rounded hover:bg-blue-50 transition flex justify-between items-center"
                    >
                      <span className="font-mono">Image path</span>
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  handleDeleteImage(selectedImage.id);
                  setShowPreview(false);
                }}
                className="w-full mt-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
