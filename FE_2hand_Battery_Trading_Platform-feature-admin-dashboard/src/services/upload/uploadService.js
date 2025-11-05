/**
 * Upload Service - Handle file uploads to Cloudinary
 * No backend changes needed - uploads directly from browser
 */

/**
 * Upload file to Cloudinary
 * @param {File} file - File to upload (image or video)
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadToCloudinary = async (file, options = {}) => {
  try {
    // Get Cloudinary config from environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        '❌ Cloudinary chưa được cấu hình. Vui lòng thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào file .env'
      );
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg']
    };

    const isImage = allowedTypes.image.includes(file.type);
    const isVideo = allowedTypes.video.includes(file.type);

    if (!isImage && !isVideo) {
      throw new Error('Chỉ hỗ trợ upload ảnh (JPEG, PNG, GIF, WebP) và video (MP4, WebM, OGG)');
    }

    // Validate file size
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for image
    if (file.size > maxSize) {
      throw new Error(
        `File quá lớn. Kích thước tối đa: ${isVideo ? '50MB' : '10MB'} cho ${isVideo ? 'video' : 'ảnh'}`
      );
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // Optional: Add folder organization
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    // Determine resource type
    const resourceType = isVideo ? 'video' : 'image';
    formData.append('resource_type', resourceType);

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    console.log(`📤 Uploading ${resourceType} to Cloudinary...`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();

    console.log('✅ Upload thành công:', data.secure_url);

    // Return structured result
    return {
      success: true,
      data: {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type,
        format: data.format,
        width: data.width,
        height: data.height,
        size: data.bytes,
        // For videos, include additional info
        duration: data.duration,
        // Thumbnail for videos
        thumbnail: data.resource_type === 'video' 
          ? data.secure_url.replace(/\.(mp4|webm|ogg)$/, '.jpg')
          : null
      }
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    return {
      success: false,
      error: error.message || 'Không thể upload file'
    };
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object[]>} Array of upload results
 */
export const uploadMultipleFiles = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadToCloudinary(file, options));
    const results = await Promise.all(uploadPromises);
    
    // Check if any upload failed
    const failedUploads = results.filter(result => !result.success);
    if (failedUploads.length > 0) {
      console.warn('⚠️ Some uploads failed:', failedUploads);
    }
    
    return results;
  } catch (error) {
    console.error('❌ Multiple upload error:', error);
    throw error;
  }
};

/**
 * Parse message content to check if it contains media
 * @param {string} content - Message content
 * @returns {Object} Parsed message with media info
 */
export const parseMessageContent = (content) => {
  try {
    const parsed = JSON.parse(content);
    return {
      isMedia: true,
      type: parsed.type, // 'image' or 'video'
      url: parsed.url,
      text: parsed.text || '',
      metadata: parsed.metadata || {}
    };
  } catch (error) {
    // Not a JSON message, treat as plain text
    return {
      isMedia: false,
      type: 'text',
      text: content
    };
  }
};

/**
 * Create message content with media
 * @param {string} type - Media type ('image' or 'video')
 * @param {string} url - Media URL
 * @param {string} text - Optional text message
 * @param {Object} metadata - Optional metadata (width, height, duration, etc.)
 * @returns {string} JSON string for message content
 */
export const createMediaMessageContent = (type, url, text = '', metadata = {}) => {
  return JSON.stringify({
    type,
    url,
    text,
    metadata
  });
};

export default {
  uploadToCloudinary,
  uploadMultipleFiles,
  parseMessageContent,
  createMediaMessageContent
};

