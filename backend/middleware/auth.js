const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// Middleware xác thực JWT
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không có token xác thực'
      });
    }
    
    const token = authHeader.substring(7); // Bỏ "Bearer "
    
    // Xác thực token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Tìm user
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ - User không tồn tại'
      });
    }
    
    // Kiểm tra user có active không
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }
    
    // Kiểm tra password có thay đổi sau khi token được tạo không
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu đã thay đổi. Vui lòng đăng nhập lại'
      });
    }
    
    // Cập nhật lastLogin
    user.lastLogin = new Date();
    await user.save();
    
    // Thêm user vào request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực'
    });
  }
};

// Middleware kiểm tra quyền
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập trước'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này'
      });
    }
    
    next();
  };
};

// Middleware kiểm tra quyền admin
const requireAdmin = authorize('admin');

// Middleware kiểm tra quyền nhân viên (reception + admin)
const requireStaff = authorize('admin', 'reception');

// Middleware kiểm tra quyền nhân viên dọn dẹp
const requireCleaningStaff = authorize('admin', 'cleaning');

// Middleware kiểm tra quyền khách hàng
const requireCustomer = authorize('customer');

// Middleware kiểm tra user có thể truy cập resource của chính mình
const checkResourceAccess = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  // Admin có thể truy cập tất cả
  if (req.user.role === 'admin') {
    return next();
  }
  
  // User chỉ có thể truy cập resource của chính mình
  if (req.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể truy cập thông tin của chính mình'
    });
  }
  
  next();
};

// Middleware xác thực tùy chọn (không bắt buộc)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Không có token, tiếp tục mà không set req.user
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Lỗi token nhưng vẫn tiếp tục
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireStaff,
  requireCleaningStaff,
  requireCustomer,
  checkResourceAccess,
  optionalAuth
};
