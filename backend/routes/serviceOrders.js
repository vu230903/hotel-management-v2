const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ServiceOrder = require('../models/ServiceOrder');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const { authenticate, requireStaff } = require('../middleware/auth');

// @route   GET /api/service-orders
// @desc    Lấy danh sách đơn dịch vụ
// @access  Private (Staff)
router.get('/', [authenticate, requireStaff], async (req, res) => {
  try {
    const {
      status,
      booking,
      customer,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (booking) {
      filter.booking = booking;
    }
    if (customer) {
      filter.customer = customer;
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const orders = await ServiceOrder.find(filter)
      .populate('booking', 'bookingNumber room')
      .populate('customer', 'fullName phone email')
      .populate('room', 'roomNumber roomType')
      .populate('services.service', 'name category price unit')
      .populate('assignedStaff', 'fullName role')
      .populate('createdBy', 'fullName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ServiceOrder.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get service orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn dịch vụ'
    });
  }
});

// @route   GET /api/service-orders/:id
// @desc    Lấy thông tin chi tiết đơn dịch vụ
// @access  Private (Staff)
router.get('/:id', [authenticate, requireStaff], async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id)
      .populate('booking', 'bookingNumber checkInDate checkOutDate')
      .populate('customer', 'fullName phone email')
      .populate('room', 'roomNumber roomType floor')
      .populate('services.service', 'name description category price unit preparationTime')
      .populate('assignedStaff', 'fullName role department')
      .populate('createdBy', 'fullName role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn dịch vụ'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get service order detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin đơn dịch vụ'
    });
  }
});

// @route   POST /api/service-orders
// @desc    Tạo đơn dịch vụ mới
// @access  Private (Staff)
router.post('/', [
  authenticate,
  requireStaff,
  body('booking')
    .notEmpty()
    .withMessage('Booking không được để trống')
    .isMongoId()
    .withMessage('ID booking không hợp lệ'),
  body('services')
    .isArray({ min: 1 })
    .withMessage('Phải có ít nhất 1 dịch vụ'),
  body('services.*.service')
    .isMongoId()
    .withMessage('ID dịch vụ không hợp lệ'),
  body('services.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Số lượng phải là số nguyên dương'),
  body('requestedTime')
    .isISO8601()
    .withMessage('Thời gian yêu cầu không hợp lệ')
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

    const { booking: bookingId, services, requestedTime, notes } = req.body;

    // Verify booking exists and is active
    const booking = await Booking.findById(bookingId)
      .populate('customer', '_id fullName')
      .populate('room', '_id roomNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy booking'
      });
    }

    if (!['confirmed', 'checked_in'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể đặt dịch vụ cho booking đã xác nhận hoặc đã check-in'
      });
    }

    // Verify all services exist and calculate total
    let totalAmount = 0;
    const serviceItems = [];

    for (const item of services) {
      const service = await Service.findById(item.service);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy dịch vụ ${item.service}`
        });
      }

      if (!service.isActive) {
        return res.status(400).json({
          success: false,
          message: `Dịch vụ "${service.name}" hiện không khả dụng`
        });
      }

      // Check max quantity
      if (service.maxQuantity && item.quantity > service.maxQuantity) {
        return res.status(400).json({
          success: false,
          message: `Dịch vụ "${service.name}" chỉ cho phép tối đa ${service.maxQuantity} ${service.unitDisplay}`
        });
      }

      const itemTotal = service.price * item.quantity;
      totalAmount += itemTotal;

      serviceItems.push({
        service: service._id,
        quantity: item.quantity,
        price: service.price,
        notes: item.notes || ''
      });
    }

    // Create service order
    const serviceOrder = new ServiceOrder({
      booking: booking._id,
      customer: booking.customer._id,
      room: booking.room._id,
      services: serviceItems,
      totalAmount,
      requestedTime: new Date(requestedTime),
      notes,
      createdBy: req.user._id
    });

    await serviceOrder.save();

    // Populate for response
    await serviceOrder.populate([
      { path: 'booking', select: 'bookingNumber' },
      { path: 'customer', select: 'fullName phone' },
      { path: 'room', select: 'roomNumber' },
      { path: 'services.service', select: 'name category price unit' },
      { path: 'createdBy', select: 'fullName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Tạo đơn dịch vụ thành công',
      data: serviceOrder
    });

  } catch (error) {
    console.error('Create service order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đơn dịch vụ'
    });
  }
});

// @route   PUT /api/service-orders/:id/status
// @desc    Cập nhật trạng thái đơn dịch vụ
// @access  Private (Staff)
router.put('/:id/status', [
  authenticate,
  requireStaff,
  body('status')
    .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),
  body('assignedStaff')
    .optional()
    .isArray()
    .withMessage('Danh sách nhân viên phải là mảng'),
  body('assignedStaff.*')
    .optional()
    .isMongoId()
    .withMessage('ID nhân viên không hợp lệ')
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

    const { status, assignedStaff, notes } = req.body;

    const order = await ServiceOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn dịch vụ'
      });
    }

    // Update status
    order.status = status;

    // Update assigned staff if provided
    if (assignedStaff) {
      order.assignedStaff = assignedStaff;
    }

    // Update completion time
    if (status === 'completed' && !order.actualCompletionTime) {
      order.actualCompletionTime = new Date();
    }

    // Update notes if provided
    if (notes) {
      order.notes = notes;
    }

    await order.save();

    // Populate for response
    await order.populate([
      { path: 'assignedStaff', select: 'fullName role' },
      { path: 'services.service', select: 'name category' }
    ]);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái đơn dịch vụ thành công',
      data: order
    });

  } catch (error) {
    console.error('Update service order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn dịch vụ'
    });
  }
});

// @route   PUT /api/service-orders/:id/payment
// @desc    Cập nhật thanh toán đơn dịch vụ
// @access  Private (Staff)
router.put('/:id/payment', [
  authenticate,
  requireStaff,
  body('payment.method')
    .optional()
    .isIn(['cash', 'card', 'transfer', 'room_charge'])
    .withMessage('Phương thức thanh toán không hợp lệ'),
  body('payment.status')
    .isIn(['pending', 'paid', 'refunded'])
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

    const order = await ServiceOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn dịch vụ'
      });
    }

    // Update payment
    if (req.body.payment.method) {
      order.payment.method = req.body.payment.method;
    }
    order.payment.status = req.body.payment.status;

    if (req.body.payment.status === 'paid' && !order.payment.paidAt) {
      order.payment.paidAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Cập nhật thanh toán thành công',
      data: order
    });

  } catch (error) {
    console.error('Update service order payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thanh toán'
    });
  }
});

// @route   DELETE /api/service-orders/:id
// @desc    Hủy đơn dịch vụ
// @access  Private (Staff)
router.delete('/:id', [authenticate, requireStaff], async (req, res) => {
  try {
    const order = await ServiceOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn dịch vụ'
      });
    }

    if (['in_progress', 'completed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn dịch vụ đang thực hiện hoặc đã hoàn thành'
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Hủy đơn dịch vụ thành công'
    });

  } catch (error) {
    console.error('Cancel service order error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi hủy đơn dịch vụ'
    });
  }
});

module.exports = router;
