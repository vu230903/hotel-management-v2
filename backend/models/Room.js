const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  // Thông tin cơ bản phòng
  roomNumber: {
    type: String,
    required: [true, 'Số phòng là bắt buộc'],
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: [true, 'Tầng là bắt buộc'],
    min: [1, 'Tầng phải lớn hơn 0']
  },
  
  // Loại phòng
  roomType: {
    type: String,
    required: [true, 'Loại phòng là bắt buộc'],
    enum: ['standard', 'deluxe', 'presidential'],
    default: 'standard'
  },
  
  // Giá phòng
  basePrice: {
    type: Number,
    required: [true, 'Giá cơ bản là bắt buộc'],
    min: [0, 'Giá phòng không được âm']
  },
  
  // Giá theo giờ (cho same-day booking)
  hourlyPrice: {
    firstHour: {
      type: Number,
      default: 100000,
      min: [0, 'Giá giờ đầu không được âm']
    },
    additionalHour: {
      type: Number,
      default: 20000,
      min: [0, 'Giá giờ tiếp theo không được âm']
    }
  },
  
  // Mô tả
  description: {
    type: String,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  
  // Tiện nghi
  amenities: [{
    type: String,
    enum: [
      'wifi', 'tv', 'minibar', 'air_conditioning', 'balcony', 
      'sea_view', 'city_view', 'jacuzzi', 'kitchen', 'washing_machine',
      'safe', 'telephone', 'room_service', 'laundry_service', 'breakfast'
    ]
  }],
  
  // Thông tin phòng
  maxOccupancy: {
    type: Number,
    required: [true, 'Số người tối đa là bắt buộc'],
    min: [1, 'Số người tối đa phải lớn hơn 0'],
    max: [10, 'Số người tối đa không được quá 10']
  },
  bedType: {
    type: String,
    enum: ['single', 'double', 'queen'],
    required: true
  },
  roomSize: {
    type: Number, // m²
    required: [true, 'Diện tích phòng là bắt buộc'],
    min: [10, 'Diện tích phòng phải lớn hơn 10m²']
  },
  
  // Trạng thái phòng
  status: {
    type: String,
    enum: [
      'available',      // Có sẵn
      'occupied',       // Đang sử dụng
      'reserved',       // Đã đặt (chưa check-in)
      'maintenance',    // Bảo trì
      'cleaning',       // Đang dọn dẹp
      'needs_cleaning', // Cần dọn dẹp
      'out_of_order'    // Hỏng hóc
    ],
    default: 'available'
  },
  
  // Trạng thái dọn dẹp
  cleaningStatus: {
    type: String,
    enum: [
      'clean',          // Sạch sẽ
      'dirty',          // Cần dọn dẹp
      'cleaning',       // Đang dọn dẹp
      'maintenance_required' // Cần bảo trì
    ],
    default: 'clean'
  },
  
  // Thông tin đặt phòng hiện tại
  currentBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  // Lịch sử bảo trì
  maintenanceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    description: String,
    cost: Number,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Hình ảnh - chỉ lưu URL string đơn giản
  images: [{
    type: String,
    trim: true
  }],
  
  // Video - chỉ lưu URL string đơn giản
  videos: [{
    type: String,
    trim: true
  }],
  
  // Cấu hình giá theo mùa
  seasonalPricing: [{
    startDate: Date,
    endDate: Date,
    multiplier: {
      type: Number,
      min: 0.1,
      max: 5.0,
      default: 1.0
    },
    reason: String // Lý do tăng/giảm giá
  }]
}, {
  timestamps: true
});

// Indexes
roomSchema.index({ roomNumber: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ cleaningStatus: 1 });
roomSchema.index({ basePrice: 1 });

// Virtual: Giá hiện tại (có thể thay đổi theo mùa)
roomSchema.virtual('currentPrice').get(function() {
  const now = new Date();
  const seasonalPrice = this.seasonalPricing.find(price => 
    now >= price.startDate && now <= price.endDate
  );
  
  if (seasonalPrice) {
    return Math.round(this.basePrice * seasonalPrice.multiplier);
  }
  
  return this.basePrice;
});

// Method: Kiểm tra phòng có sẵn trong khoảng thời gian
roomSchema.methods.isAvailable = async function(checkIn, checkOut) {
  const Booking = mongoose.model('Booking');
  
  // Kiểm tra trạng thái phòng
  if (this.status !== 'available') {
    return false;
  }
  
  // Kiểm tra xung đột với các booking hiện có
  const conflictingBookings = await Booking.find({
    room: this._id,
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    $or: [
      // Check-in trong khoảng thời gian
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  });
  
  return conflictingBookings.length === 0;
};

// Static method: Lấy danh sách phòng có sẵn trong khoảng thời gian
roomSchema.statics.getAvailableRooms = async function(checkIn, checkOut, filters = {}) {
  const Booking = mongoose.model('Booking');
  
  // Tìm các phòng bị xung đột
  const conflictingBookings = await Booking.find({
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    $or: [
      {
        checkIn: { $lt: new Date(checkOut) },
        checkOut: { $gt: new Date(checkIn) }
      }
    ]
  }).select('room');
  
  const conflictingRoomIds = conflictingBookings.map(booking => booking.room);
  
  // Tạo filter để loại trừ phòng bị xung đột
  const availabilityFilter = {
    status: 'available',
    _id: { $nin: conflictingRoomIds },
    ...filters
  };
  
  return this.find(availabilityFilter);
};

// Method: Cập nhật trạng thái dọn dẹp
roomSchema.methods.updateCleaningStatus = function(status, userId) {
  this.cleaningStatus = status;
  
  // Cập nhật trạng thái phòng dựa trên cleaning status
  if (status === 'cleaning') {
    // Nhân viên dọn dẹp bắt đầu làm việc
    this.status = 'cleaning';
  } else if (status === 'clean') {
    // Hoàn thành dọn dẹp, phòng có thể đặt
    this.status = 'available';
  } else if (status === 'dirty') {
    // Phòng cần dọn dẹp (sau check-out) - không thay đổi status
    // Giữ nguyên status hiện tại (needs_cleaning)
  } else if (status === 'maintenance_required') {
    // Cần bảo trì
    this.status = 'maintenance';
  }
  
  return this.save();
};

module.exports = mongoose.model('Room', roomSchema);
