const mongoose = require('mongoose');

const serviceOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking không được để trống']
  },
  
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Khách hàng không được để trống']
  },
  
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Phòng không được để trống']
  },
  
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: [
      'pending',      // Chờ xử lý
      'confirmed',    // Đã xác nhận
      'in_progress',  // Đang thực hiện
      'completed',    // Hoàn thành
      'cancelled'     // Đã hủy
    ],
    default: 'pending'
  },
  
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'transfer', 'room_charge'],
      default: 'room_charge'
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    paidAt: {
      type: Date
    }
  },
  
  requestedTime: {
    type: Date,
    required: true
  },
  
  estimatedCompletionTime: {
    type: Date
  },
  
  actualCompletionTime: {
    type: Date
  },
  
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  notes: {
    type: String,
    trim: true
  },
  
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    ratedAt: {
      type: Date
    }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
serviceOrderSchema.index({ booking: 1, status: 1 });
serviceOrderSchema.index({ customer: 1, createdAt: -1 });
serviceOrderSchema.index({ orderNumber: 1 });
serviceOrderSchema.index({ 'services.service': 1 });

// Generate order number
serviceOrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now();
    this.orderNumber = `SO${timestamp}`;
  }
  next();
});

// Calculate estimated completion time
serviceOrderSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('services') || this.isModified('requestedTime')) {
    // Calculate total preparation time from all services
    const totalPrepTime = this.services.reduce((total, item) => {
      return total + (item.service.preparationTime || 0) * item.quantity;
    }, 0);
    
    this.estimatedCompletionTime = new Date(this.requestedTime.getTime() + totalPrepTime * 60000);
  }
  next();
});

// Virtual for status display
serviceOrderSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    'pending': '⏳ Chờ xử lý',
    'confirmed': '✅ Đã xác nhận', 
    'in_progress': '🔄 Đang thực hiện',
    'completed': '✅ Hoàn thành',
    'cancelled': '❌ Đã hủy'
  };
  return statusMap[this.status] || this.status;
});

module.exports = mongoose.model('ServiceOrder', serviceOrderSchema);
