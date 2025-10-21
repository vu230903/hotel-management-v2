const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/rooms
// @desc    Lấy danh sách phòng
// @access  Public (có thể filter theo role)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      roomType, 
      status, 
      minPrice, 
      maxPrice, 
      floor,
      amenities,
      available,
      checkIn,
      checkOut
    } = req.query;
    
    // Tạo filter
    const filter = {};
    
    if (roomType) {
      filter.roomType = roomType;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = parseInt(minPrice);
      if (maxPrice) filter.basePrice.$lte = parseInt(maxPrice);
    }
    
    if (floor) {
      filter.floor = parseInt(floor);
    }
    
    if (amenities) {
      const amenityList = amenities.split(',');
      filter.amenities = { $all: amenityList };
    }
    
    // Filter phòng có sẵn trong khoảng thời gian
    if (available === 'true' && checkIn && checkOut) {
      // Sử dụng static method để lấy phòng có sẵn
      const availableRooms = await Room.getAvailableRooms(checkIn, checkOut, filter);
      
      // Tính pagination cho kết quả đã lọc
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRooms = availableRooms.slice(skip, skip + parseInt(limit));
      
      res.json({
        success: true,
        data: {
          rooms: paginatedRooms,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(availableRooms.length / parseInt(limit)),
            total: availableRooms.length
          }
        }
      });
      return;
    }
    
    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const rooms = await Room.find(filter)
      .sort({ floor: 1, roomNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Room.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        rooms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách phòng'
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Lấy thông tin phòng theo ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    res.json({
      success: true,
      data: { room }
    });
    
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin phòng'
    });
  }
});

// @route   POST /api/rooms
// @desc    Tạo phòng mới (Admin/Staff)
// @access  Private (Admin/Staff)
router.post('/', [
  authenticate,
  requireStaff,
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Số phòng là bắt buộc'),
  body('floor')
    .isInt({ min: 1 })
    .withMessage('Tầng phải là số nguyên dương'),
  body('roomType')
    .isIn(['standard', 'deluxe', 'presidential'])
    .withMessage('Loại phòng không hợp lệ'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Giá cơ bản phải lớn hơn hoặc bằng 0'),
  body('maxOccupancy')
    .isInt({ min: 1, max: 10 })
    .withMessage('Số người tối đa phải từ 1-10'),
  body('bedType')
    .isIn(['single', 'double', 'queen'])
    .withMessage('Loại giường không hợp lệ'),
  body('roomSize')
    .isFloat({ min: 10 })
    .withMessage('Diện tích phòng phải lớn hơn 10m²')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const {
      roomNumber,
      floor,
      roomType,
      basePrice,
      description,
      amenities = [],
      maxOccupancy,
      bedType,
      roomSize,
      images = []
    } = req.body;
    
    // Xử lý ảnh base64
    const processedImages = images.map(image => {
      if (typeof image === 'string') {
        // Nếu là base64 string
        return {
          data: image,
          filename: `room_${roomNumber}_${Date.now()}.jpg`,
          mimetype: 'image/jpeg',
          size: Math.round((image.length * 3) / 4), // Ước tính kích thước từ base64
          caption: `Hình ảnh phòng ${roomNumber}`,
          isPrimary: false,
          type: 'normal'
        };
      } else if (image.data) {
        // Nếu đã có cấu trúc đầy đủ
        return {
          data: image.data,
          filename: image.filename || `room_${roomNumber}_${Date.now()}.jpg`,
          mimetype: image.mimetype || 'image/jpeg',
          size: image.size || Math.round((image.data.length * 3) / 4),
          caption: image.caption || `Hình ảnh phòng ${roomNumber}`,
          isPrimary: image.isPrimary || false,
          type: image.type || 'normal'
        };
      }
      return image;
    });
    
    // Kiểm tra số phòng đã tồn tại
    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Số phòng đã tồn tại'
      });
    }
    
    const room = new Room({
      roomNumber,
      floor,
      roomType,
      basePrice,
      description,
      amenities,
      maxOccupancy,
      bedType,
      roomSize,
      images: processedImages
    });
    
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo phòng thành công',
      data: { room }
    });
    
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo phòng'
    });
  }
});

// @route   PUT /api/rooms/:id
// @desc    Cập nhật thông tin phòng (Admin/Staff)
// @access  Private (Admin/Staff)
router.put('/:id', [
  authenticate,
  requireStaff,
  body('roomNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Số phòng không được để trống'),
  body('floor')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Tầng phải là số nguyên dương'),
  body('roomType')
    .optional()
    .isIn(['standard', 'deluxe', 'suite'])
    .withMessage('Loại phòng không hợp lệ'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Giá cơ bản phải lớn hơn hoặc bằng 0'),
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'cleaning', 'out_of_order'])
    .withMessage('Trạng thái phòng không hợp lệ'),
  body('cleaningStatus')
    .optional()
    .isIn(['clean', 'dirty', 'cleaning', 'maintenance_required'])
    .withMessage('Trạng thái dọn dẹp không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const updateData = { ...req.body };
    
    // Xử lý ảnh - chỉ lưu URL string đơn giản
    if (updateData.images && Array.isArray(updateData.images)) {
      console.log('Processing images for update:', updateData.images.length);
      
      updateData.images = updateData.images
        .filter(image => {
          if (!image) return false;
          
          // Chấp nhận cả URL (http/https) và Base64 (data:)
          if (typeof image === 'string' && (image.startsWith('http') || image.startsWith('data:'))) {
            return true;
          }
          
          // Nếu là object, lấy data field
          if (typeof image === 'object' && image.data && (image.data.startsWith('http') || image.data.startsWith('data:'))) {
            return true;
          }
          
          console.log('Skipping invalid image:', typeof image, image);
          return false;
        })
        .map(image => {
          // Trả về URL string đơn giản
          if (typeof image === 'string') {
            return image;
          } else if (typeof image === 'object' && image.data) {
            return image.data;
          }
          return image;
        });
      
      console.log('Filtered URL images:', updateData.images);
    }
    
    // Xử lý video - chỉ lưu URL string đơn giản
    if (updateData.videos && Array.isArray(updateData.videos)) {
      console.log('Processing videos for update:', updateData.videos.length);
      
      updateData.videos = updateData.videos
        .filter(video => {
          if (!video) return false;
          
          // Chấp nhận cả URL (http/https) và Base64 (data:)
          if (typeof video === 'string' && (video.startsWith('http') || video.startsWith('data:'))) {
            return true;
          }
          
          // Nếu là object, lấy data field
          if (typeof video === 'object' && video.data && (video.data.startsWith('http') || video.data.startsWith('data:'))) {
            return true;
          }
          
          console.log('Skipping invalid video:', typeof video, video);
          return false;
        })
        .map(video => {
          // Trả về URL string đơn giản
          if (typeof video === 'string') {
            return video;
          } else if (typeof video === 'object' && video.data) {
            return video.data;
          }
          return video;
        });
      
      console.log('Filtered URL videos:', updateData.videos);
    }
    
    // Kiểm tra số phòng trùng lặp (nếu có thay đổi)
    if (updateData.roomNumber) {
      const existingRoom = await Room.findOne({
        _id: { $ne: req.params.id },
        roomNumber: updateData.roomNumber
      });
      
      if (existingRoom) {
        return res.status(400).json({
          success: false,
          message: 'Số phòng đã tồn tại'
        });
      }
    }
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật phòng thành công',
      data: { room }
    });
    
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật phòng'
    });
  }
});

// @route   PUT /api/rooms/:id/status
// @desc    Cập nhật trạng thái phòng (Staff)
// @access  Private (Staff)
router.put('/:id/status', [
  authenticate,
  requireStaff,
  body('status')
    .isIn(['available', 'occupied', 'reserved', 'maintenance', 'cleaning', 'needs_cleaning', 'out_of_order'])
    .withMessage('Trạng thái phòng không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const { status } = req.body;
    
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái phòng thành công',
      data: { room }
    });
    
  } catch (error) {
    console.error('Update room status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái phòng'
    });
  }
});

// @route   PUT /api/rooms/:id/cleaning-status
// @desc    Cập nhật trạng thái dọn dẹp (Cleaning Staff)
// @access  Private (Cleaning Staff)
router.put('/:id/cleaning-status', [
  authenticate,
  requireStaff, // Có thể thay đổi thành requireCleaningStaff
  body('cleaningStatus')
    .isIn(['clean', 'dirty', 'cleaning', 'maintenance_required'])
    .withMessage('Trạng thái dọn dẹp không hợp lệ')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const { cleaningStatus } = req.body;
    
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    // Sử dụng method updateCleaningStatus
    await room.updateCleaningStatus(cleaningStatus, req.user._id);
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái dọn dẹp thành công',
      data: { room }
    });
    
  } catch (error) {
    console.error('Update cleaning status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái dọn dẹp'
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Xóa phòng (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa phòng thành công'
    });
    
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa phòng'
    });
  }
});

// @route   GET /api/rooms/:id/images/360
// @desc    Lấy hình ảnh 360 độ của phòng
// @access  Public
router.get('/:id/images/360', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    // Lọc chỉ hình ảnh 360
    const images360 = room.images.filter(img => img.type === '360' || img.is360);
    
    res.json({
      success: true,
      data: {
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        images360: images360
      }
    });
    
  } catch (error) {
    console.error('Error getting 360 images:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy hình ảnh 360'
    });
  }
});

// @route   POST /api/rooms/:id/images/360
// @desc    Thêm hình ảnh 360 độ cho phòng
// @access  Admin/Staff
router.post('/:id/images/360', authenticate, requireStaff, [
  body('url').notEmpty().withMessage('URL hình ảnh là bắt buộc'),
  body('caption').optional().isString(),
  body('format').optional().isIn(['equirectangular', 'cubemap']),
  body('resolution').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    const { url, caption, format = 'equirectangular', resolution = '4K' } = req.body;
    
    // Tạo hình ảnh 360 mới
    const newImage360 = {
      url,
      caption: caption || `Hình ảnh 360° - Phòng ${room.roomNumber}`,
      type: '360',
      is360: true,
      isPrimary: false,
      panoramaData: {
        cameraPosition: { x: 0, y: 1.6, z: 0 },
        format,
        resolution
      }
    };
    
    // Thêm vào mảng images
    room.images.push(newImage360);
    await room.save();
    
    res.status(201).json({
      success: true,
      message: 'Thêm hình ảnh 360 thành công',
      data: newImage360
    });
    
  } catch (error) {
    console.error('Error adding 360 image:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thêm hình ảnh 360'
    });
  }
});

// @route   GET /api/rooms/availability
// @desc    Kiểm tra tính khả dụng của phòng trong khoảng thời gian
// @access  Public
router.get('/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, roomType, amenities } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ngày check-in và check-out'
      });
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-out phải sau ngày check-in'
      });
    }
    
    // Build filters
    const filters = {};
    if (roomType) {
      filters.roomType = roomType;
    }
    if (amenities) {
      const amenityList = amenities.split(',');
      filters.amenities = { $all: amenityList };
    }
    
    // Get available rooms
    const availableRooms = await Room.getAvailableRooms(checkIn, checkOut, filters);
    
    // Calculate nights
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    
    // Add pricing information
    const roomsWithPricing = availableRooms.map(room => ({
      ...room.toObject(),
      nights,
      totalPrice: room.currentPrice * nights,
      isAvailable: true
    }));
    
    res.json({
      success: true,
      data: {
        rooms: roomsWithPricing,
        total: availableRooms.length,
        checkIn,
        checkOut,
        nights
      }
    });
    
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra tính khả dụng'
    });
  }
});

// @route   GET /api/rooms/:id/availability
// @desc    Kiểm tra tính khả dụng của một phòng cụ thể
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ngày check-in và check-out'
      });
    }
    
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    const isAvailable = await room.isAvailable(checkIn, checkOut);
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    
    res.json({
      success: true,
      data: {
        room: {
          ...room.toObject(),
          nights,
          totalPrice: room.currentPrice * nights,
          isAvailable
        },
        checkIn,
        checkOut,
        nights
      }
    });
    
  } catch (error) {
    console.error('Check room availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi kiểm tra tính khả dụng phòng'
    });
  }
});

module.exports = router;
