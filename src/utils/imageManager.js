/**
 * Image Manager for Blog Platform
 * Handles image compression, storage, and optimization
 */

/**
 * Compress image to reduce file size
 * @param {File|Blob} file - Image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 1200)
 * @param {number} quality - JPEG quality 0-1 (default: 0.8)
 */
export const compressImage = async (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let { width, height } = img;

        // Resize if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            resolve({
              blob,
              dataUrl: canvas.toDataURL('image/jpeg', quality),
              width,
              height,
              size: blob.size,
              type: 'image/jpeg'
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate unique image filename with timestamp
 * @param {File} file - Original file
 * @returns {string} - Unique filename
 */
export const generateImageFilename = (file) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const extension = file.type.split('/')[1] || 'jpg';
  return `img-${timestamp}-${randomId}.${extension}`;
};

/**
 * Create image metadata object
 * @param {Object} options - Image options
 */
export const createImageMetadata = ({ id, filename, originalName, size, width, height, dataUrl, alt = '' }) => {
  return {
    id,
    filename,
    originalName,
    size,
    width,
    height,
    alt,
    uploadedAt: new Date().toISOString(),
    isCompressed: true
  };
};

/**
 * Store image metadata in localStorage
 * @param {string} postId - Blog post ID
 * @param {Object} imageMetadata - Image metadata
 */
export const saveImageMetadata = (postId, imageMetadata) => {
  const allImages = JSON.parse(localStorage.getItem('blog-image-metadata') || '{}');
  
  if (!allImages[postId]) {
    allImages[postId] = [];
  }
  
  allImages[postId].push(imageMetadata);
  localStorage.setItem('blog-image-metadata', JSON.stringify(allImages));
  
  return imageMetadata;
};

/**
 * Get all image metadata for a post
 * @param {string} postId - Blog post ID
 */
export const getImageMetadata = (postId) => {
  const allImages = JSON.parse(localStorage.getItem('blog-image-metadata') || '{}');
  return allImages[postId] || [];
};

/**
 * Delete image metadata for a post
 * @param {string} postId - Blog post ID
 * @param {string} imageId - Image ID
 */
export const deleteImageMetadata = (postId, imageId) => {
  const allImages = JSON.parse(localStorage.getItem('blog-image-metadata') || '{}');
  
  if (allImages[postId]) {
    allImages[postId] = allImages[postId].filter(img => img.id !== imageId);
    if (allImages[postId].length === 0) {
      delete allImages[postId];
    }
    localStorage.setItem('blog-image-metadata', JSON.stringify(allImages));
  }
};

/**
 * Store image data URL in localStorage
 * @param {string} imageId - Unique image ID
 * @param {string} dataUrl - Base64 data URL
 */
export const saveImageData = (imageId, dataUrl) => {
  const allImageData = JSON.parse(localStorage.getItem('blog-image-data') || '{}');
  allImageData[imageId] = dataUrl;
  localStorage.setItem('blog-image-data', JSON.stringify(allImageData));
};

/**
 * Get image data URL from localStorage
 * @param {string} imageId - Unique image ID
 */
export const getImageData = (imageId) => {
  const allImageData = JSON.parse(localStorage.getItem('blog-image-data') || '{}');
  return allImageData[imageId] || null;
};

/**
 * Get all image data for display
 * @param {string} postId - Blog post ID
 */
export const getPostImages = (postId) => {
  const metadata = getImageMetadata(postId);
  const images = {};
  
  metadata.forEach(img => {
    const dataUrl = getImageData(img.id);
    images[img.id] = {
      ...img,
      dataUrl,
      // For public access, use the file path
      publicUrl: `/blog-images/${img.filename}`
    };
  });
  
  return images;
};

/**
 * Clean up image data when post is deleted
 * @param {string} postId - Blog post ID
 */
export const deletePostImages = (postId) => {
  const metadata = getImageMetadata(postId);
  const imageDataStorage = JSON.parse(localStorage.getItem('blog-image-data') || '{}');
  
  metadata.forEach(img => {
    delete imageDataStorage[img.id];
  });
  
  localStorage.setItem('blog-image-data', JSON.stringify(imageDataStorage));
  
  const allImages = JSON.parse(localStorage.getItem('blog-image-metadata') || '{}');
  delete allImages[postId];
  localStorage.setItem('blog-image-metadata', JSON.stringify(allImages));
};

/**
 * Get estimated storage usage
 */
export const getStorageUsage = () => {
  const imageData = localStorage.getItem('blog-image-data') || '{}';
  const metadata = localStorage.getItem('blog-image-metadata') || '{}';
  
  // Rough estimate in KB
  const imageDataSize = new Blob([imageData]).size / 1024;
  const metadataSize = new Blob([metadata]).size / 1024;
  
  return {
    imageData: Math.round(imageDataSize),
    metadata: Math.round(metadataSize),
    total: Math.round(imageDataSize + metadataSize)
  };
};

/**
 * Convert image markdown with ID to public path
 * @param {string} content - Content with image IDs
 * @param {Object} imageMap - Map of image IDs to public URLs
 */
export const replaceImageIds = (content, imageMap) => {
  let updated = content;
  
  Object.entries(imageMap).forEach(([imageId, metadata]) => {
    // Replace both ![name](id) and ![name](id "alt text") patterns
    const patterns = [
      new RegExp(`!\\[([^\\]]*)\\]\\(${imageId}\\s+"([^"]*)"\\)`, 'g'),
      new RegExp(`!\\[([^\\]]*)\\]\\(${imageId}\\)`, 'g')
    ];
    
    patterns.forEach(pattern => {
      updated = updated.replace(pattern, (match, alt, title) => {
        const altText = alt || metadata.alt || metadata.originalName;
        const titleAttr = title ? ` "${title}"` : '';
        return `![${altText}](${metadata.publicUrl}${titleAttr})`;
      });
    });
  });
  
  return updated;
};

/**
 * Extract image IDs from markdown content
 * @param {string} content - Markdown content
 */
export const extractImageIds = (content) => {
  const imageIdPattern = /!\[[^\]]*\]\((\d+)\)/g;
  const matches = [...content.matchAll(imageIdPattern)];
  return matches.map(m => m[1]);
};

/**
 * Validate image file
 */
export const validateImageFile = (file, maxSizeMB = 10) => {
  const errors = [];
  
  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }
  
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`Image size must be less than ${maxSizeMB}MB`);
  }
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, WebP, and GIF images are supported');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get file size display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
