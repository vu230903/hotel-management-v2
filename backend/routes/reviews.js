const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews
// @desc    Lấy danh sách đánh giá
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      room, 
      customer,
      status = 'approved',
      sort = 'createdAt'
    } = req.query;
    
    // Tạo filter
    const filter = {};
    
    if (room) {
      filter.room = room;
    }
    
    if (customer) {
      filter.customer = customer;
    }
    
    if (status) {
      filter.status = status;
    }
    
    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find(filter)
      .populate('customer', 'fullName avatar')
      .populate('room', 'roomNumber roomType')
      .populate('booking', 'bookingNumber checkIn checkOut')
      .sort({ [sort]: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đánh giá'
    });
  }
});

// @route   GET /api/reviews/customer
// @desc    Lấy đánh giá của khách hàng
// @access  Private (Customer)
router.get('/customer', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reviews = await Review.find({ customer: req.user._id })
      .populate('room', 'roomNumber roomType')
      .populate('booking', 'bookingNumber checkIn checkOut')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Review.countDocuments({ customer: req.user._id });
    
    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy đánh giá của khách hàng'
    });
  }
});

// @route   GET /api/reviews/bookings-for-review
// @desc    Lấy danh sách đặt phòng có thể đánh giá
// @access  Private (Customer)
router.get('/bookings-for-review', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
      status: 'checked_out'
    })
    .populate('room', 'roomNumber roomType')
    .sort({ checkOut: -1 });
    
    // Lọc ra những booking chưa có review
    const bookingsWithoutReview = [];
    
    for (const booking of bookings) {
      const existingReview = await Review.findOne({
        booking: booking._id,
        customer: req.user._id
      });
      
      if (!existingReview) {
        bookingsWithoutReview.push(booking);
      }
    }
    
    res.json({
      success: true,
      data: {
        bookings: bookingsWithoutReview
      }
    });
    
  } catch (error) {
    console.error('Get bookings for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đặt phòng có thể đánh giá'
    });
  }
});

// @route   POST /api/reviews
// @desc    Tạo đánh giá mới
// @access  Private (Customer)
router.post('/', [
  authenticate,
  body('booking')
    .isMongoId()
    .withMessage('ID đặt phòng không hợp lệ'),
  body('overallRating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá tổng thể phải từ 1-5 sao'),
  body('detailedRatings.cleanliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá sạch sẽ phải từ 1-5 sao'),
  body('detailedRatings.comfort')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá tiện nghi phải từ 1-5 sao'),
  body('detailedRatings.location')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá vị trí phải từ 1-5 sao'),
  body('detailedRatings.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá giá trị phải từ 1-5 sao'),
  body('detailedRatings.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Đánh giá dịch vụ phải từ 1-5 sao'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Bình luận phải từ 10-1000 ký tự'),
  body('mentionedAmenities')
    .optional()
    .isArray()
    .withMessage('Tiện nghi phải là mảng')
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
      booking,
      overallRating,
      detailedRatings,
      comment,
      mentionedAmenities = [],
      images = []
    } = req.body;
    
    // Kiểm tra booking có tồn tại không
    const bookingData = await Booking.findById(booking)
      .populate('room')
      .populate('customer');
    
    if (!bookingData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    // Kiểm tra booking có thuộc về customer không
    if (bookingData.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể đánh giá đặt phòng của chính mình'
      });
    }
    
    // Kiểm tra booking đã check-out chưa
    if (bookingData.status !== 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đánh giá sau khi check-out'
      });
    }
    
    // Kiểm tra đã có review chưa
    const existingReview = await Review.findOne({
      booking: booking,
      customer: req.user._id
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá đặt phòng này rồi'
      });
    }
    
    // Tạo review
    const review = new Review({
      customer: req.user._id,
      booking: booking,
      room: bookingData.room._id,
      overallRating,
      detailedRatings: {
        cleanliness: detailedRatings.cleanliness || overallRating,
        comfort: detailedRatings.comfort || overallRating,
        location: detailedRatings.location || overallRating,
        value: detailedRatings.value || overallRating,
        service: detailedRatings.service || overallRating
      },
      comment,
      mentionedAmenities,
      images,
      status: 'pending'
    });
    
    await review.save();
    
    // Populate để trả về đầy đủ thông tin
    await review.populate([
      { path: 'customer', select: 'fullName avatar' },
      { path: 'room', select: 'roomNumber roomType' },
      { path: 'booking', select: 'bookingNumber checkIn checkOut' }
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Tạo đánh giá thành công',
      data: { review }
    });
    
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đánh giá'
    });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Đánh dấu review hữu ích
// @access  Private
router.put('/:id/helpful', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    await review.markHelpful(req.user._id);
    
    res.json({
      success: true,
      message: 'Đánh dấu hữu ích thành công',
      data: { 
        helpfulCount: review.helpful.count,
        isHelpful: review.helpful.users.includes(req.user._id)
      }
    });
    
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đánh dấu hữu ích'
    });
  }
});

// @route   PUT /api/reviews/:id/unhelpful
// @desc    Bỏ đánh dấu review hữu ích
// @access  Private
router.put('/:id/unhelpful', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    await review.unmarkHelpful(req.user._id);
    
    res.json({
      success: true,
      message: 'Bỏ đánh dấu hữu ích thành công',
      data: { 
        helpfulCount: review.helpful.count,
        isHelpful: review.helpful.users.includes(req.user._id)
      }
    });
    
  } catch (error) {
    console.error('Unmark helpful error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi bỏ đánh dấu hữu ích'
    });
  }
});

// @route   PUT /api/reviews/:id/status
// @desc    Cập nhật trạng thái review (Staff/Admin)
// @access  Private (Staff/Admin)
router.put('/:id/status', [
  authenticate,
  requireStaff,
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'hidden'])
    .withMessage('Trạng thái không hợp lệ'),
  body('internalNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Ghi chú nội bộ không được quá 500 ký tự')
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
    
    const { status, internalNotes } = req.body;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    review.status = status;
    if (internalNotes) {
      review.internalNotes = internalNotes;
    }
    
    await review.save();
    
    res.json({
      success: true,
      message: 'Cập nhật trạng thái đánh giá thành công',
      data: { review }
    });
    
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đánh giá'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Xóa đánh giá
// @access  Private (Customer hoặc Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đánh giá'
      });
    }
    
    // Customer chỉ có thể xóa review của mình, Admin có thể xóa tất cả
    if (req.user.role !== 'admin' && review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể xóa đánh giá của chính mình'
      });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Xóa đánh giá thành công'
    });
    
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đánh giá'
    });
  }
});

module.exports = router;
