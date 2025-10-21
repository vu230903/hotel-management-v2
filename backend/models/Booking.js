const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Mã đặt phòng
  bookingNumber: {
    type: String,
    unique: true,
    required: [true, 'Mã đặt phòng là bắt buộc']
  },
  
  // Thông tin khách hàng
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Thông tin khách hàng là bắt buộc']
  },
  
  // Thông tin phòng
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Thông tin phòng là bắt buộc']
  },
  
  // Thời gian đặt phòng
  checkIn: {
    type: Date,
    required: [true, 'Ngày check-in là bắt buộc']
  },
  checkOut: {
    type: Date,
    required: [true, 'Ngày check-out là bắt buộc']
  },
  
  // Số lượng khách
  guests: {
    adults: {
      type: Number,
      required: [true, 'Số người lớn là bắt buộc'],
      min: [1, 'Phải có ít nhất 1 người lớn'],
      max: [10, 'Không được quá 10 người lớn']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Số trẻ em không được âm'],
      max: [5, 'Không được quá 5 trẻ em']
    }
  },
  
  // Trạng thái đặt phòng
  status: {
    type: String,
    enum: [
      'pending',        // Chờ xác nhận
      'confirmed',      // Đã xác nhận
      'checked_in',     // Đã check-in
      'checked_out',    // Đã check-out
      'cancelled',      // Đã hủy
      'no_show'         // Không đến
    ],
    default: 'pending'
  },
  
  // Thông tin thanh toán
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'online'],
      required: [true, 'Phương thức thanh toán là bắt buộc']
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    amount: {
      type: Number,
      required: [true, 'Số tiền là bắt buộc'],
      min: [0, 'Số tiền không được âm']
    },
    paidAt: Date,
    transactionId: String
  },
  
  // Giá phòng
  roomPrice: {
    type: Number,
    required: [true, 'Giá phòng là bắt buộc']
  },
  
  // Dịch vụ bổ sung
  additionalServices: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    price: Number,
    totalPrice: Number
  }],
  
  // Tổng tiền
  totalAmount: {
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc']
  },
  
  // Ghi chú
  notes: {
    customer: String, // Ghi chú từ khách hàng
    staff: String,    // Ghi chú từ nhân viên
    specialRequests: String // Yêu cầu đặc biệt
  },
  
  // Thông tin check-in/check-out
  checkInInfo: {
    actualCheckIn: Date,
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roomKey: String,
    additionalGuests: [{
      name: String,
      idNumber: String
    }]
  },
  
  checkOutInfo: {
    actualCheckOut: Date,
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roomCondition: {
      type: String,
      enum: ['good', 'damaged', 'needs_cleaning', 'needs_maintenance']
    },
    damages: [{
      description: String,
      cost: Number
    }]
  },
  
  // Đánh giá
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: Date
  },
  
  // Lịch sử thay đổi
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Indexes
bookingSchema.index({ customer: 1 });
bookingSchema.index({ room: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual: Số đêm ở
bookingSchema.virtual('nights').get(function() {
  const diffTime = Math.abs(this.checkOut - this.checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual: Có thể hủy không
bookingSchema.virtual('canCancel').get(function() {
  const now = new Date();
  const checkInDate = new Date(this.checkIn);
  const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
  
  return this.status === 'pending' || this.status === 'confirmed' && hoursUntilCheckIn > 24;
});

// Pre-save middleware: Tính tổng tiền
bookingSchema.pre('save', function(next) {
  if (this.isModified('roomPrice') || this.isModified('additionalServices')) {
    let total = this.roomPrice * this.nights;
    
    if (this.additionalServices && this.additionalServices.length > 0) {
      total += this.additionalServices.reduce((sum, service) => {
        return sum + (service.totalPrice || 0);
      }, 0);
    }
    
    this.totalAmount = total;
    this.payment.amount = total;
  }
  next();
});

// Method: Cập nhật trạng thái
bookingSchema.methods.updateStatus = async function(newStatus, userId, reason) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    reason: reason
  });
  
  // Cập nhật trạng thái phòng dựa trên trạng thái booking mới
  const Room = mongoose.model('Room');
  const room = await Room.findById(this.room);
  
  if (room) {
    if (newStatus === 'checked_in') {
      room.status = 'occupied';
      room.currentBooking = this._id;
    } else if (newStatus === 'confirmed') {
      console.log('🔄 Updating room status to reserved for booking:', this._id);
      console.log('🔄 Room before update:', room.roomNumber, 'status:', room.status);
      room.status = 'reserved';
      room.currentBooking = this._id;
      console.log('🔄 Room after update:', room.roomNumber, 'status:', room.status);
    } else if (newStatus === 'pending') {
      room.status = 'reserved';
      room.currentBooking = this._id;
    } else if (newStatus === 'checked_out') {
      // Khi check-out, phòng cần dọn dẹp (mặc định)
      room.status = 'cleaning';
      room.cleaningStatus = 'dirty';
      room.currentBooking = null;
    } else if (newStatus === 'cancelled' || newStatus === 'no_show') {
      room.status = 'available';
      room.currentBooking = null;
    }
    
    console.log('🔄 Saving room to database...');
    await room.save();
    console.log('✅ Room saved successfully:', room.roomNumber, 'status:', room.status);
  }
  
  return this.save();
};

  // Method: Check-in
bookingSchema.methods.performCheckIn = function(userId, roomKey, additionalGuests, customCheckInTime) {
  this.status = 'checked_in';
  
  // Sử dụng giờ tùy chỉnh nếu có, nếu không thì dùng giờ hiện tại
  let actualCheckInTime = new Date();
  if (customCheckInTime) {
    // Parse giờ từ string (HH:MM) và set vào ngày hiện tại
    const [hours, minutes] = customCheckInTime.split(':');
    actualCheckInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  this.checkInInfo = {
    actualCheckIn: actualCheckInTime,
    checkedInBy: userId,
    roomKey: roomKey,
    additionalGuests: additionalGuests || [],
    customCheckInTime: customCheckInTime || null
  };
  this.statusHistory.push({
    status: 'checked_in',
    changedBy: userId,
    reason: customCheckInTime ? `Customer checked in at ${customCheckInTime}` : 'Customer checked in'
  });
  return this.save();
};

// Method: Check-out
bookingSchema.methods.performCheckOut = async function(userId, roomCondition, damages, customCheckOutTime) {
  this.status = 'checked_out';

  // Sử dụng giờ tùy chỉnh nếu có, nếu không thì dùng giờ hiện tại
  let actualCheckOutTime = new Date();
  if (customCheckOutTime) {
    // Parse giờ từ string (HH:MM) và set vào ngày hiện tại
    const [hours, minutes] = customCheckOutTime.split(':');
    actualCheckOutTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }

  // Tính lại tổng tiền dựa trên thời gian thực tế sử dụng
  if (this.checkInInfo && this.checkInInfo.actualCheckIn) {
    const actualCheckInTime = new Date(this.checkInInfo.actualCheckIn);
    const timeDiff = actualCheckOutTime - actualCheckInTime;
    const actualHours = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60))); // Tối thiểu 1 giờ
    
    // Kiểm tra xem có phải sử dụng trong ngày không
    const checkInDate = new Date(actualCheckInTime);
    const checkOutDate = new Date(actualCheckOutTime);
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);
    const isSameDay = checkInDate.getTime() === checkOutDate.getTime();
    
    if (isSameDay) {
      // Sử dụng trong ngày - tính theo giờ
      // Cần populate room để lấy hourlyPrice
      await this.populate('room');
      const rates = this.room?.hourlyPrice || {
        firstHour: 100000,
        additionalHour: 20000
      };
      
      let newTotalAmount = 0;
      if (actualHours === 1) {
        newTotalAmount = rates.firstHour;
      } else {
        newTotalAmount = rates.firstHour + (rates.additionalHour * (actualHours - 1));
      }
      
      // Cập nhật tổng tiền
      this.totalAmount = newTotalAmount;
      this.payment.amount = newTotalAmount;
      
      console.log(`💰 Recalculated total for same-day usage: ${actualHours} hours = ${newTotalAmount} VND`);
    } else {
      // Qua đêm - tính theo đêm
      const actualNights = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
      this.totalAmount = this.roomPrice * actualNights;
      this.payment.amount = this.totalAmount;
      
      console.log(`💰 Recalculated total for overnight: ${actualNights} nights = ${this.totalAmount} VND`);
    }
  }

  this.checkOutInfo = {
    actualCheckOut: actualCheckOutTime,
    checkedOutBy: userId,
    roomCondition: roomCondition,
    damages: damages || [],
    customCheckOutTime: customCheckOutTime || null
  };
  this.statusHistory.push({
    status: 'checked_out',
    changedBy: userId,
    reason: customCheckOutTime ? `Customer checked out at ${customCheckOutTime}` : 'Customer checked out'
  });
  return this.save();
};

module.exports = mongoose.model('Booking', bookingSchema);
