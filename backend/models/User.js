const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Thông tin cơ bản
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ tên không được quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    unique: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự']
  },
  
  // Phân quyền
  role: {
    type: String,
    enum: ['admin', 'reception', 'cleaning', 'customer'],
    default: 'customer',
    required: true
  },
  
  // Trạng thái tài khoản
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Thông tin bổ sung cho khách hàng
  address: {
    type: String,
    maxlength: [200, 'Địa chỉ không được quá 200 ký tự']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Social login accounts
  socialAccounts: {
    google: String,
    facebook: String
  },
  avatar: {
    type: String // URL to profile picture
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Thông tin bổ sung cho nhân viên
  employeeId: {
    type: String,
    unique: true,
    sparse: true // Cho phép null cho khách hàng
  },
  department: {
    type: String,
    enum: ['reception', 'cleaning', 'management'],
    required: function() {
      return this.role !== 'customer';
    }
  },
  hireDate: {
    type: Date,
    required: function() {
      return this.role !== 'customer';
    }
  },
  
  // Ghi chú
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không được quá 500 ký tự']
  },
  banInfo: {
    type: {
      type: String,
      enum: ['temporary', 'permanent']
    },
    duration: {
      type: Number,
      min: 1,
      max: 365
    },
    reason: {
      type: String,
      maxlength: [500, 'Lý do khóa không được quá 500 ký tự']
    },
    bannedAt: {
      type: Date
    },
    until: {
      type: Date
    }
  },
  
  // Timestamps
  lastLogin: {
    type: Date
  },
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ employeeId: 1 });

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Kiểm tra password đã thay đổi sau khi JWT được tạo
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Ẩn password khi trả về JSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordChangedAt;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
