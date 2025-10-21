const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { authenticate, requireStaff, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Bookings API is working!' });
});

// @route   GET /api/bookings
// @desc    Lấy danh sách đặt phòng
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      checkIn, 
      checkOut,
      customer,
      room
    } = req.query;
    
    // Tạo filter
    const filter = {};
    
    // Khách hàng chỉ xem được booking của mình
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (customer && req.user.role !== 'customer') {
      filter.customer = customer;
    }
    
    if (room) {
      filter.room = room;
    }
    
    if (checkIn) {
      filter.checkIn = { $gte: new Date(checkIn) };
    }
    
    if (checkOut) {
      filter.checkOut = { $lte: new Date(checkOut) };
    }
    
    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bookings = await Booking.find(filter)
      .populate('customer', 'fullName email phone')
      .populate('room', 'roomNumber roomType basePrice floor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Booking.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đặt phòng'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Lấy thông tin đặt phòng theo ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'fullName email phone address')
      .populate('room', 'roomNumber roomType basePrice floor amenities')
      .populate('additionalServices.service', 'name price category');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    // Khách hàng chỉ xem được booking của mình
    if (req.user.role === 'customer' && booking.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đặt phòng này'
      });
    }
    
    res.json({
      success: true,
      data: { booking }
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đặt phòng'
    });
  }
});

// @route   POST /api/bookings
// @desc    Tạo đặt phòng mới
// @access  Private
router.post('/', [
  authenticate,
  body('customer')
    .optional()
    .isMongoId()
    .withMessage('ID khách hàng không hợp lệ'),
  body('room')
    .isMongoId()
    .withMessage('ID phòng không hợp lệ'),
  body('checkIn')
    .isISO8601()
    .withMessage('Ngày check-in không hợp lệ'),
  body('checkOut')
    .isISO8601()
    .withMessage('Ngày check-out không hợp lệ'),
  body('guests.adults')
    .optional()
    .custom((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 10;
    })
    .withMessage('Số người lớn phải từ 1-10'),
  body('guests.children')
    .optional()
    .custom((value) => {
      if (value === undefined || value === '') return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= 0 && num <= 5;
    })
    .withMessage('Số trẻ em phải từ 0-5'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'])
    .withMessage('Trạng thái đặt phòng không hợp lệ'),
  body('payment.method')
    .isIn(['cash', 'card', 'bank_transfer', 'online'])
    .withMessage('Phương thức thanh toán không hợp lệ')
], async (req, res) => {
  try {
    console.log('🚀 POST /api/bookings called');
    console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const {
      customer,
      room,
      checkIn,
      checkOut,
      guests,
      payment,
      additionalServices = [],
      notes = {},
      bookingNumber,
      status = 'pending' // Thêm status với default là pending
    } = req.body;

    console.log('Backend received booking data:');
    console.log('- status:', status);
    console.log('- payment:', payment);
    console.log('- full req.body:', JSON.stringify(req.body, null, 2));
    
    // Xác định customer - nếu admin/staff tạo booking cho khách khác thì dùng customer từ request, nếu không thì dùng user hiện tại
    let customerId = req.user._id; // Mặc định là user hiện tại
    
    if (customer && (req.user.role === 'admin' || req.user.role === 'reception')) {
      // Admin/Staff có thể tạo booking cho khách khác
      customerId = customer;
    }
    
    // Kiểm tra customer có tồn tại không (nếu khác user hiện tại)
    if (customerId !== req.user._id) {
      const customerData = await User.findById(customerId);
      if (!customerData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng'
        });
      }
    }

    // Kiểm tra phòng có tồn tại không
    const roomData = await Room.findById(room);
    if (!roomData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng'
      });
    }
    
    console.log('🏨 Room data found:', {
      _id: roomData._id,
      roomNumber: roomData.roomNumber,
      basePrice: roomData.basePrice,
      hourlyPrice: roomData.hourlyPrice,
      status: roomData.status
    });
    
    // Kiểm tra phòng có sẵn không
    if (roomData.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Phòng không có sẵn'
      });
    }
    
    // Kiểm tra xung đột booking với các booking hiện có
    const conflictingBookings = await Booking.find({
      room: room,
      status: { $in: ['confirmed', 'checked_in'] },
      $or: [
        {
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) }
        }
      ]
    });
    
    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Phòng đã được đặt trong khoảng thời gian này',
        conflictingBookings: conflictingBookings.map(booking => ({
          bookingNumber: booking.bookingNumber,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          customer: booking.customer
        }))
      });
    }
    
    // Kiểm tra ngày check-in/check-out
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();
    
    // Cho phép đặt phòng cùng ngày (same-day booking)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    checkInDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-in không thể trước ngày hiện tại'
      });
    }
    
    // Cho phép check-out cùng ngày với check-in (same-day booking)
    checkOutDate.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (checkOutDate < checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Ngày check-out không thể trước ngày check-in'
      });
    }
    
    // Tính giá phòng
    const nights = Math.max(0, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    let roomPrice = 0;
    
    console.log(`🏨 Room pricing calculation: nights=${nights}, checkIn=${checkIn}, checkOut=${checkOut}`);
    
    if (nights === 0) {
      // Sử dụng trong ngày - tính theo giờ
      const checkInTime = req.body.checkInTime || '13:00';
      const checkOutTime = req.body.checkOutTime || '12:00';
      const checkInTimeObj = new Date(`${checkIn}T${checkInTime}`);
      const checkOutTimeObj = new Date(`${checkOut}T${checkOutTime}`);
      const hoursDiff = Math.max(1, Math.ceil((checkOutTimeObj - checkInTimeObj) / (1000 * 60 * 60)));
      
      console.log(`⏰ Time calculation: checkInTime=${checkInTime}, checkOutTime=${checkOutTime}, hoursDiff=${hoursDiff}`);
      
      const rates = roomData.hourlyPrice || {
        firstHour: 100000,
        additionalHour: 20000
      };
      
      console.log('💰 Hourly rates from room:', rates);
      
      if (hoursDiff === 1) {
        roomPrice = rates.firstHour;
      } else {
        roomPrice = rates.firstHour + (rates.additionalHour * (hoursDiff - 1));
      }
      
      console.log(`💰 Same-day pricing: ${hoursDiff} hours = ${roomPrice} VND`);
    } else {
      // Qua đêm - tính theo đêm
      roomPrice = roomData.basePrice * nights;
      console.log(`💰 Overnight pricing: ${nights} nights = ${roomPrice} VND`);
    }
    
    // Tính giá dịch vụ bổ sung
    let additionalServicesTotal = 0;
    if (additionalServices.length > 0) {
      // Logic tính giá dịch vụ sẽ được implement sau
      additionalServicesTotal = 0;
    }
    
    const totalAmount = roomPrice + additionalServicesTotal;
    
    // Tạo mã đặt phòng tự động nếu không có từ frontend
    const finalBookingNumber = bookingNumber || `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    console.log('📝 Creating booking with data:', {
      bookingNumber: finalBookingNumber,
      customer: customerId,
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      roomPrice,
      totalAmount,
      status,
      payment: {
        method: payment.method,
        amount: totalAmount,
        status: payment.status || 'pending'
      }
    });

    const booking = new Booking({
      bookingNumber: finalBookingNumber,
      customer: customerId, // Sử dụng customerId đã xác định
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      payment: {
        method: payment.method,
        amount: totalAmount,
        status: payment.status || 'pending'
      },
      roomPrice,
      additionalServices,
      totalAmount,
      notes,
      status: status // Thêm status từ request
    });
    
    try {
      console.log('💾 Saving booking to database...');
      await booking.save();
      console.log('✅ Booking saved successfully with ID:', booking._id);
    } catch (saveError) {
      console.error('❌ Error saving booking:', saveError);
      console.error('❌ Save error details:', {
        message: saveError.message,
        stack: saveError.stack,
        name: saveError.name
      });
      throw saveError;
    }
    
    // Nếu tạo booking với status checked_in hoặc checked_out, tự động tạo checkInInfo/checkOutInfo
    try {
      if (status === 'checked_in') {
        await booking.performCheckIn(req.user._id, `Phòng ${roomData.roomNumber}`, [], null);
        console.log('✅ Check-in performed');
      } else if (status === 'checked_out') {
        // Trước tiên phải check-in, rồi mới check-out
        await booking.performCheckIn(req.user._id, `Phòng ${roomData.roomNumber}`, [], null);
        await booking.performCheckOut(req.user._id, 'good', [], null);
        console.log('✅ Check-in and check-out performed');
      }
    } catch (checkError) {
      console.error('❌ Error performing check-in/out:', checkError);
      throw checkError;
    }
    
    console.log('Booking created with status:', booking.status);
    
    // Cập nhật trạng thái phòng dựa trên trạng thái booking
    if (status === 'checked_in') {
      roomData.status = 'occupied';
      roomData.currentBooking = booking._id;
    } else if (status === 'confirmed') {
      roomData.status = 'reserved';
      roomData.currentBooking = booking._id;
    } else if (status === 'pending') {
      // Khi booking pending, phòng vẫn có thể được đặt nhưng cần xác nhận
      roomData.status = 'reserved';
      roomData.currentBooking = booking._id;
    } else {
      // cancelled hoặc các status khác
      roomData.status = 'available';
      roomData.currentBooking = null;
    }
    await roomData.save();
    
    // Populate để trả về đầy đủ thông tin
    try {
      console.log('🔄 Starting booking populate...');
      await booking.populate([
        { path: 'customer', select: 'fullName email phone' },
        { path: 'room', select: 'roomNumber roomType basePrice hourlyPrice floor' }
      ]);
      console.log('✅ Booking populated successfully');
      console.log('📊 Populated booking data:', {
        bookingNumber: booking.bookingNumber,
        customer: booking.customer,
        room: booking.room,
        status: booking.status
      });
    } catch (populateError) {
      console.error('❌ Error populating booking:', populateError);
      console.error('❌ Populate error details:', {
        message: populateError.message,
        stack: populateError.stack
      });
      throw populateError;
    }
    
    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công',
      data: { booking }
    });
    
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đặt phòng'
    });
  }
});

// @route   PUT /api/bookings/:id/status
// @desc    Cập nhật trạng thái đặt phòng (Staff)
// @access  Private (Staff)
router.put('/:id/status', [
  authenticate,
  requireStaff,
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'])
    .withMessage('Trạng thái không hợp lệ'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Lý do không được quá 200 ký tự'),
  body('customer')
    .optional()
    .isMongoId()
    .withMessage('ID khách hàng không hợp lệ'),
  body('room')
    .optional()
    .isMongoId()
    .withMessage('ID phòng không hợp lệ'),
  body('checkIn')
    .optional()
    .isISO8601()
    .withMessage('Ngày check-in không hợp lệ'),
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Ngày check-out không hợp lệ'),
  body('guests.adults')
    .optional()
    .custom((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 10;
    })
    .withMessage('Số người lớn phải từ 1-10'),
  body('guests.children')
    .optional()
    .custom((value) => {
      const num = parseInt(value);
      return !isNaN(num) && num >= 0 && num <= 5;
    })
    .withMessage('Số trẻ em phải từ 0-5'),
  body('payment.method')
    .optional()
    .isIn(['cash', 'card', 'bank_transfer', 'online'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  body('payment.status')
    .optional()
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Trạng thái thanh toán không hợp lệ')
], async (req, res) => {
  try {
    console.log('PUT /api/bookings/:id/status called with ID:', req.params.id);
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      console.log('Request body for validation:', req.body);
      console.log('guests object:', req.body.guests);
      console.log('guests.adults type:', typeof req.body.guests?.adults);
      console.log('guests.children type:', typeof req.body.guests?.children);
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }
    
    const { 
      status, 
      reason, 
      customer, 
      room, 
      checkIn, 
      checkOut, 
      guests, 
      payment,
      notes,
      totalAmount,
      roomPrice
    } = req.body;
    
    console.log('Extracted data:', { status, customer, room, checkIn, checkOut, guests, payment });
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('Booking not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    console.log('Found booking:', booking.bookingNumber, 'Current status:', booking.status);
    
    // Cập nhật các trường được cung cấp
    console.log('Updating booking fields...');
    if (customer) {
      console.log('Updating customer from', booking.customer, 'to', customer);
      booking.customer = customer;
    }
    if (room) {
      console.log('Updating room from', booking.room, 'to', room);
      booking.room = room;
    }
    if (checkIn) {
      console.log('Updating checkIn from', booking.checkIn, 'to', checkIn);
      booking.checkIn = new Date(checkIn);
    }
    if (checkOut) {
      console.log('Updating checkOut from', booking.checkOut, 'to', checkOut);
      booking.checkOut = new Date(checkOut);
    }
    if (guests) {
      console.log('Updating guests from', booking.guests, 'to', guests);
      booking.guests = guests;
    }
    if (payment) {
      console.log('Updating payment from', booking.payment, 'to', payment);
      booking.payment = { ...booking.payment, ...payment };
    }
    if (notes !== undefined) {
      console.log('Updating notes from', booking.notes, 'to', notes);
      booking.notes = notes;
    }
    if (totalAmount) {
      console.log('Updating totalAmount from', booking.totalAmount, 'to', totalAmount);
      booking.totalAmount = totalAmount;
    }
    if (roomPrice) {
      console.log('Updating roomPrice from', booking.roomPrice, 'to', roomPrice);
      booking.roomPrice = roomPrice;
    }
    
    // Cập nhật trạng thái nếu có
    if (status) {
      console.log('Updating status from', booking.status, 'to', status);
      await booking.updateStatus(status, req.user._id, reason);
    } else {
      console.log('Saving booking without status change...');
      await booking.save();
    }
    
    // Cập nhật trạng thái phòng nếu cần
    if (status === 'cancelled' || status === 'no_show') {
      const roomData = await Room.findById(booking.room);
      if (roomData) {
        roomData.status = 'available';
        roomData.currentBooking = null;
        await roomData.save();
      }
    }
    
    // Populate để trả về đầy đủ thông tin
    console.log('Populating booking data...');
    await booking.populate([
      { path: 'customer', select: 'fullName email phone' },
      { path: 'room', select: 'roomNumber roomType basePrice hourlyPrice floor' }
    ]);
    
    console.log('Successfully updated booking:', booking.bookingNumber);
    res.json({
      success: true,
      message: 'Cập nhật đặt phòng thành công',
      data: { booking }
    });
    
  } catch (error) {
    console.error('Update booking status error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đặt phòng'
    });
  }
});

// @route   PUT /api/bookings/:id/check-in
// @desc    Check-in khách (Staff)
// @access  Private (Staff)
router.put('/:id/check-in', [
  authenticate,
  requireStaff,
  body('roomKey')
    .trim()
    .notEmpty()
    .withMessage('Mã phòng là bắt buộc'),
  body('additionalGuests')
    .optional()
    .isArray()
    .withMessage('Danh sách khách bổ sung phải là array'),
  body('checkInTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Giờ check-in không hợp lệ (định dạng HH:MM)')
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
    
    const { roomKey, additionalGuests = [], checkInTime } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể check-in đặt phòng đã xác nhận'
      });
    }
    
    // Thực hiện check-in với giờ tùy chỉnh
    await booking.performCheckIn(req.user._id, roomKey, additionalGuests, checkInTime);
    
    res.json({
      success: true,
      message: 'Check-in thành công',
      data: { booking }
    });
    
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi check-in'
    });
  }
});

// @route   PUT /api/bookings/:id/check-out
// @desc    Check-out khách (Staff)
// @access  Private (Staff)
router.put('/:id/check-out', [
  authenticate,
  requireStaff,
  body('roomCondition')
    .isIn(['good', 'damaged', 'needs_cleaning', 'needs_maintenance'])
    .withMessage('Tình trạng phòng không hợp lệ'),
  body('checkOutTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Giờ check-out không hợp lệ (định dạng HH:MM)')
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
    
    const { roomCondition, damages = [], checkOutTime } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể check-out khách đã check-in'
      });
    }
    
    // Thực hiện check-out với giờ tùy chỉnh
    console.log('🕐 Check-out with custom time:', checkOutTime);
    await booking.performCheckOut(req.user._id, roomCondition, damages, checkOutTime);
    console.log('✅ CheckOutInfo after performCheckOut:', booking.checkOutInfo);
    console.log('💰 Updated totalAmount after checkout:', booking.totalAmount);
    
    // Cập nhật trạng thái phòng dựa trên tình trạng phòng
    const room = await Room.findById(booking.room);
    if (room) {
      // Cập nhật trạng thái phòng dựa trên roomCondition
      switch (roomCondition) {
        case 'good':
          room.status = 'available';
          room.cleaningStatus = 'clean';
          break;
        case 'needs_cleaning':
          room.status = 'needs_cleaning';
          room.cleaningStatus = 'dirty';
          break;
        case 'needs_maintenance':
          room.status = 'maintenance';
          room.cleaningStatus = 'dirty';
          break;
        case 'damaged':
          room.status = 'out_of_order';
          room.cleaningStatus = 'dirty';
          break;
        default:
          room.status = 'cleaning'; // Mặc định cần dọn dẹp
          room.cleaningStatus = 'dirty';
      }
      room.currentBooking = null;
      await room.save();
    }
    
    // Populate để trả về đầy đủ thông tin
    await booking.populate([
      { path: 'customer', select: 'fullName email phone' },
      { path: 'room', select: 'roomNumber roomType basePrice hourlyPrice floor' }
    ]);
    
    console.log('Check-out response:', {
      bookingId: booking._id,
      status: booking.status,
      checkOutInfo: booking.checkOutInfo
    });
    
    res.json({
      success: true,
      message: 'Check-out thành công',
      data: { 
        booking, 
        checkOutInfo: booking.checkOutInfo,
        totalAmount: booking.totalAmount // Trả về tổng tiền đã được tính lại
      }
    });
    
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi check-out'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Hủy đặt phòng
// @access  Private
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    // Khách hàng chỉ có thể hủy booking của mình
    if (req.user.role === 'customer' && booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn chỉ có thể hủy đặt phòng của chính mình'
      });
    }
    
    // Kiểm tra có thể hủy không (chỉ áp dụng cho customer)
    if (req.user.role === 'customer' && !booking.canCancel) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đặt phòng này'
      });
    }
    
    // Admin/Staff có thể hủy bất kỳ booking nào
    if (req.user.role !== 'customer' && (booking.status === 'checked_in' || booking.status === 'checked_out')) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đặt phòng đã check-in hoặc check-out'
      });
    }
    
    // Hủy đặt phòng
    await booking.updateStatus('cancelled', req.user._id, 'Customer cancelled');
    
    // Cập nhật trạng thái phòng
    const room = await Room.findById(booking.room);
    if (room) {
      room.status = 'available';
      room.currentBooking = null;
      await room.save();
    }
    
    res.json({
      success: true,
      message: 'Hủy đặt phòng thành công',
      data: { booking }
    });
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy đặt phòng'
    });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Xóa đặt phòng (chỉ admin)
// @access  Private (Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    console.log('DELETE /api/bookings/:id called with ID:', req.params.id);
    console.log('User:', req.user);
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }
    
    console.log('Found booking:', booking.bookingNumber, 'Status:', booking.status);

    // Cho phép xóa tất cả trạng thái trừ checked_in
    if (booking.status === 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa đặt phòng đang check-in'
      });
    }
    
    // Xóa booking
    await Booking.findByIdAndDelete(req.params.id);
    
    console.log('Successfully deleted booking:', req.params.id);
    res.json({
      success: true,
      message: 'Xóa đặt phòng thành công'
    });
    
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa đặt phòng'
    });
  }
});

// @route   PUT /api/bookings/:id/payment-status
// @desc    Cập nhật trạng thái thanh toán
// @access  Private (Staff)
router.put('/:id/payment-status', [
  authenticate,
  requireStaff,
  body('status')
    .isIn(['pending', 'paid', 'refunded', 'failed'])
    .withMessage('Trạng thái thanh toán không hợp lệ')
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
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt phòng'
      });
    }

    // Cập nhật trạng thái thanh toán
    booking.payment.status = status;
    await booking.save();

    res.json({
      success: true,
      message: `Cập nhật trạng thái thanh toán thành ${status === 'paid' ? 'đã thanh toán' : 'chờ thanh toán'}`,
      data: { booking }
    });
    
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái thanh toán'
    });
  }
});

module.exports = router;
