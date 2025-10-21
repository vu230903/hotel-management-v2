const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, requireAdmin, requireStaff, checkResourceAccess } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Lấy danh sách users (Admin/Staff)
// @access  Private (Admin/Staff)
router.get('/', authenticate, requireStaff, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    
    // Tạo filter
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tính pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users'
    });
  }
});

// @route   POST /api/users
// @desc    Tạo user mới (Admin only)
// @access  Private (Admin)
router.post('/', [
  authenticate,
  requireAdmin,
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
         body('address')
           .optional()
           .trim()
           .isLength({ max: 200 })
           .withMessage('Địa chỉ không được quá 200 ký tự'),
         body('dateOfBirth')
           .optional()
           .isISO8601()
           .withMessage('Ngày sinh không hợp lệ'),
         body('gender')
           .optional()
           .isIn(['male', 'female', 'other'])
           .withMessage('Giới tính không hợp lệ'),
         body('role')
           .isIn(['admin', 'reception', 'cleaning', 'customer'])
           .withMessage('Role không hợp lệ'),
         body('status')
           .optional()
           .isIn(['active', 'inactive', 'banned'])
           .withMessage('Status không hợp lệ'),
         body('password')
           .optional()
           .isLength({ min: 6, max: 50 })
           .withMessage('Mật khẩu phải có từ 6-50 ký tự')
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
    
           const { fullName, email, phone, address, dateOfBirth, gender, role, status, notes } = req.body;
    
    // Kiểm tra email/phone trùng lặp
    const existingUser = await User.findOne({
      $or: [
        { email },
        ...(phone ? [{ phone }] : [])
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email đã được sử dụng' : 'Số điện thoại đã được sử dụng'
      });
    }
    
           // Tạo user mới
           const user = new User({
             fullName,
             email,
             phone,
             address,
             dateOfBirth: req.body.dateOfBirth,
             gender: req.body.gender,
             role,
             status: status || 'active',
             notes,
             isActive: (status || 'active') === 'active',
             password: req.body.password || 'temp123456', // Mật khẩu từ form hoặc mặc định
             createdAt: new Date(),
             updatedAt: new Date()
           });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: { user: await User.findById(user._id).select('-password') }
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo user'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Lấy thông tin user theo ID
// @access  Private
router.get('/:id', authenticate, checkResourceAccess, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Cập nhật thông tin user
// @access  Private
router.put('/:id', [
  authenticate,
  checkResourceAccess,
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Địa chỉ không được quá 200 ký tự'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ')
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
    
    const { fullName, email, phone, address, dateOfBirth, gender } = req.body;
    
    // Kiểm tra email/phone trùng lặp (nếu có thay đổi)
    if (email || phone) {
      const existingUser = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.email === email ? 'Email đã được sử dụng' : 'Số điện thoại đã được sử dụng'
        });
      }
    }
    
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: { user }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật user'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Thay đổi role của user (Admin only)
// @access  Private (Admin)
router.put('/:id/role', [
  authenticate,
  requireAdmin,
  body('role')
    .isIn(['admin', 'reception', 'cleaning', 'customer'])
    .withMessage('Role không hợp lệ'),
  body('department')
    .optional()
    .isIn(['reception', 'cleaning', 'management'])
    .withMessage('Department không hợp lệ')
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
    
    const { role, department, employeeId } = req.body;
    
    const updateData = { role };
    
    // Nếu là nhân viên, thêm thông tin bổ sung
    if (role !== 'customer') {
      if (department) updateData.department = department;
      if (employeeId) updateData.employeeId = employeeId;
      if (!req.body.hireDate) {
        updateData.hireDate = new Date();
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Thay đổi role thành công',
      data: { user }
    });
    
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thay đổi role'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Thay đổi trạng thái user (Admin only)
// @access  Private (Admin)
router.put('/:id/status', [
  authenticate,
  requireAdmin,
  body('isActive')
    .isBoolean()
    .withMessage('isActive phải là boolean')
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
    
    const { isActive } = req.body;
    const status = isActive ? 'active' : 'inactive';
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isActive,
        status 
      },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: `User đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`,
      data: { user }
    });
    
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi thay đổi trạng thái user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Xóa user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }
    
    res.json({
      success: true,
      message: 'Xóa user thành công'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa user'
    });
  }
});

// @desc    Khóa user (Admin only)
// @access  Private (Admin)
router.put('/:id/ban', [
  authenticate,
  requireAdmin,
  body('type')
    .isIn(['temporary', 'permanent'])
    .withMessage('Loại khóa không hợp lệ'),
  body('duration')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 365;
    })
    .withMessage('Thời gian khóa phải từ 1-365 ngày'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Lý do khóa không được quá 500 ký tự'),
  body('until')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true;
      return new Date(value).toString() !== 'Invalid Date';
    })
    .withMessage('Ngày hết hạn không hợp lệ')
], async (req, res) => {
  try {
    console.log('Ban user request:', req.body);
    console.log('User ID:', req.params.id);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { type, duration, reason, until } = req.body;
    console.log('Ban data:', { type, duration, reason, until });

    const updateData = {
      status: 'banned',
      isActive: false,
      banInfo: {
        type,
        reason: reason || '',
        bannedAt: new Date(),
        until: until || null
      }
    };
    
    // Chỉ thêm duration nếu là temporary
    if (type === 'temporary' && duration) {
      updateData.banInfo.duration = parseInt(duration);
    }

    console.log('Update data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      message: `Đã ${type === 'permanent' ? 'khóa vĩnh viễn' : `khóa tạm thời ${duration} ngày`} user thành công`,
      data: { user }
    });

  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi khóa user'
    });
  }
});

// @desc    Mở khóa user (Admin only)
// @access  Private (Admin)
router.put('/:id/unban', [
  authenticate,
  requireAdmin
], async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'active',
        isActive: true,
        $unset: { banInfo: 1 }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      message: 'Đã mở khóa user thành công',
      data: { user }
    });

  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi mở khóa user'
    });
  }
});

module.exports = router;
