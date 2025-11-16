export const validateTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.trim().length === 0) {
    return { isValid: false, error: 'Title cannot be empty' };
  }
  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' };
  }
  if (title.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters' };
  }
  return { isValid: true, error: null };
};

export const validateContent = (content) => {
  if (!content || typeof content !== 'string') {
    return { isValid: false, error: 'Content is required' };
  }
  if (content.trim().length === 0) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  if (content.length < 10) {
    return { isValid: false, error: 'Content must be at least 10 characters' };
  }
  return { isValid: true, error: null };
};

export const validateMetaDescription = (description) => {
  if (!description) {
    return { isValid: true, error: null };
  }
  if (description.length > 160) {
    return { isValid: false, error: 'Meta description must be 160 characters or less' };
  }
  return { isValid: true, error: null };
};

export const validateUrl = (url) => {
  if (!url) {
    return { isValid: true, error: null };
  }
  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validateEmail = (email) => {
  if (!email) {
    return { isValid: true, error: null };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true, error: null };
};

export const validateFileName = (fileName) => {
  if (!fileName || typeof fileName !== 'string') {
    return { isValid: false, error: 'File name is required' };
  }
  if (fileName.trim().length === 0) {
    return { isValid: false, error: 'File name cannot be empty' };
  }
  const validChars = /^[a-zA-Z0-9\-_. ]+$/;
  if (!validChars.test(fileName)) {
    return { isValid: false, error: 'File name contains invalid characters' };
  }
  return { isValid: true, error: null };
};

export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
  }
  return { isValid: true, error: null };
};

export const validateImageFile = (file) => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validImageTypes.includes(file.type)) {
    return { isValid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }
  return validateFileSize(file, 10);
};

export const validatePostData = (postData) => {
  const errors = {};

  const titleValidation = validateTitle(postData.title);
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }

  const contentValidation = validateContent(postData.content);
  if (!contentValidation.isValid) {
    errors.content = contentValidation.error;
  }

  if (postData.metaDescription) {
    const metaValidation = validateMetaDescription(postData.metaDescription);
    if (!metaValidation.isValid) {
      errors.metaDescription = metaValidation.error;
    }
  }

  if (postData.canonicalUrl) {
    const urlValidation = validateUrl(postData.canonicalUrl);
    if (!urlValidation.isValid) {
      errors.canonicalUrl = urlValidation.error;
    }
  }

  if (postData.featuredImage) {
    const urlValidation = validateUrl(postData.featuredImage);
    if (!urlValidation.isValid) {
      errors.featuredImage = urlValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const generateValidationMessage = (field, error) => {
  return `${field}: ${error}`;
};
