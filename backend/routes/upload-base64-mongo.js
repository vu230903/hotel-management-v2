const express = require('express');
const multer = require('multer');
const { authenticate, requireStaff } = require('../middleware/auth');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit cho base64 (MongoDB có giới hạn document size)
  }
});

// @route   POST /api/upload/images-base64-mongo
// @desc    Upload multiple images/videos as base64 for MongoDB
// @access  Private (Admin/Staff)
router.post('/images-base64-mongo', authenticate, requireStaff, upload.array('images', 10), async (req, res) => {
  try {
    console.log('📤 Base64 MongoDB upload endpoint hit');
    console.log('📁 Files received:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file ảnh được upload'
      });
    }

    const imageUrls = [];
    for (const file of req.files) {
      // Convert to base64
      const base64 = file.buffer.toString('base64');
      const mimeType = file.mimetype;
      const dataUrl = `data:${mimeType};base64,${base64}`;
      
      imageUrls.push({
        url: dataUrl,
        filename: file.originalname,
        size: file.size,
        mimeType: mimeType
      });
    }
    
    console.log('✅ Base64 MongoDB upload successful:', imageUrls.length);
    res.json({
      success: true,
      message: `Upload ${imageUrls.length} file thành công`,
      data: imageUrls
    });
  } catch (error) {
    console.error('Base64 MongoDB upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload file'
    });
  }
});

module.exports = router;
