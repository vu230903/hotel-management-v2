const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const config = require('../config');
const { authenticate } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Tạo JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Verify Facebook access token
const verifyFacebookToken = async (accessToken) => {
  try {
    const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email,picture`);
    return response.data;
  } catch (error) {
    console.error('Facebook token verification failed:', error.message);
    throw new Error('Invalid Facebook token');
  }
};

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản
// @access  Public
router.post('/register', [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('phone')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('role')
    .optional()
    .isIn(['customer', 'reception', 'cleaning'])
    .withMessage('Vai trò không hợp lệ')
], async (req, res) => {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { fullName, email, phone, password, role = 'customer', address, dateOfBirth, gender } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
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
      password,
      role,
      address,
      dateOfBirth,
      gender
    });

    await user.save();

    // Tạo token
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified
        },
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
});

// @route   POST /api/auth/oauth
// @desc    Đăng nhập OAuth (Google/Facebook)
// @access  Public
router.post('/oauth', async (req, res) => {
  try {
    const { email, name, picture, provider, providerId, accessToken } = req.body;

    if (!email || !provider || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin OAuth'
      });
    }

    // Verify Facebook token if provider is facebook
    if (provider === 'facebook' && accessToken) {
      try {
        const verifiedData = await verifyFacebookToken(accessToken);
        console.log('✅ Facebook token verified:', verifiedData);
      } catch (error) {
        console.error('❌ Facebook token verification failed:', error.message);
        return res.status(401).json({
          success: false,
          message: 'Facebook token không hợp lệ'
        });
      }
    }

    // Tìm user theo email hoặc providerId
    let user = await User.findOne({
      $or: [
        { email: email },
        { [`socialAccounts.${provider}`]: providerId }
      ]
    });

    if (user) {
      // Cập nhật social account info nếu chưa có
      if (!user.socialAccounts) {
        user.socialAccounts = {};
      }
      if (!user.socialAccounts[provider]) {
        user.socialAccounts[provider] = providerId;
        user.avatar = picture || user.avatar;
        // Đảm bảo OAuth users có role customer
        if (user.role !== 'customer') {
          user.role = 'customer';
        }
        await user.save();
      }
    } else {
      // Tạo user mới từ OAuth
      user = new User({
        fullName: name || 'User',
        email: email,
        phone: '0000000000', // Placeholder, user có thể cập nhật sau
        role: 'customer',
        avatar: picture,
        socialAccounts: {
          [provider]: providerId
        },
        // Không cần password cho OAuth users
        password: Math.random().toString(36).substring(7), // Random password
        isEmailVerified: true // OAuth emails are verified
      });

      await user.save();
    }

    // Tạo JWT token
    const token = createToken(user._id);

    // Return user info
    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified
    };

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: userData,
        token: token
      }
    });

  } catch (error) {
    console.error('OAuth login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập OAuth'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
], async (req, res) => {
  try {
    // Kiểm tra validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Tìm user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Tạo token
    const token = createToken(user._id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Đổi mật khẩu
// @access  Private
router.post('/change-password', [
  authenticate,
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại là bắt buộc'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
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

    const { currentPassword, newPassword } = req.body;

    // Lấy user với password
    const user = await User.findById(req.user._id).select('+password');

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Đăng xuất (client-side sẽ xóa token)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

module.exports = router;
