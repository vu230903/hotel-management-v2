const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'hotel-rooms',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
      { format: 'auto' }
    ]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload single image
const uploadImage = async (file) => {
  try {
    console.log('🌤️ Cloudinary config:', {
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
      api_secret: config.CLOUDINARY_API_SECRET ? 'Present' : 'Missing'
    });
    
    console.log('📁 File info:', {
      path: file.path,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });
    
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'hotel-rooms',
      transformation: [
        { width: 1200, height: 800, crop: 'fill', quality: 'auto' },
        { format: 'auto' }
      ]
    });
    
    console.log('✅ Cloudinary upload result:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    throw error;
  }
};

// Upload multiple images
const uploadImages = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary batch upload error:', error);
    throw error;
  }
};

// Delete image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadImages,
  deleteImage,
  cloudinary
};
