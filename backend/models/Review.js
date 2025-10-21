const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Thông tin khách hàng
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Thông tin khách hàng là bắt buộc']
  },
  
  // Thông tin đặt phòng
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Thông tin đặt phòng là bắt buộc']
  },
  
  // Thông tin phòng
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Thông tin phòng là bắt buộc']
  },
  
  // Đánh giá tổng thể
  overallRating: {
    type: Number,
    required: [true, 'Đánh giá tổng thể là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu là 1 sao'],
    max: [5, 'Đánh giá tối đa là 5 sao']
  },
  
  // Đánh giá chi tiết
  detailedRatings: {
    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    comfort: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    location: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5,
      default: 5
    }
  },
  
  // Bình luận
  comment: {
    type: String,
    required: [true, 'Bình luận là bắt buộc'],
    trim: true,
    maxlength: [1000, 'Bình luận không được quá 1000 ký tự']
  },
  
  // Tiện nghi được đề cập
  mentionedAmenities: [{
    type: String,
    enum: [
      'wifi', 'pool', 'restaurant', 'spa', 'fitness', 'room_service',
      'air_conditioning', 'tv', 'coffee', 'parking', 'pets', 'smoking'
    ]
  }],
  
  // Trạng thái đánh giá
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  
  // Thông tin hữu ích
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Phản hồi từ khách sạn
  hotelResponse: {
    comment: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Ảnh đính kèm
  images: [{
    url: String,
    caption: String
  }],
  
  // Thông tin bổ sung
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Ghi chú nội bộ
  internalNotes: String
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ customer: 1 });
reviewSchema.index({ room: 1 });
reviewSchema.index({ booking: 1 });
reviewSchema.index({ overallRating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

// Virtual: Đánh giá trung bình chi tiết
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.detailedRatings;
  const values = Object.values(ratings).filter(val => typeof val === 'number');
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
});

// Method: Đánh giá hữu ích
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method: Bỏ đánh giá hữu ích
reviewSchema.methods.unmarkHelpful = function(userId) {
  const index = this.helpful.users.indexOf(userId);
  if (index > -1) {
    this.helpful.users.splice(index, 1);
    this.helpful.count -= 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Pre-save middleware: Cập nhật đánh giá tổng thể
reviewSchema.pre('save', function(next) {
  if (this.isModified('detailedRatings')) {
    this.overallRating = this.averageDetailedRating;
  }
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
