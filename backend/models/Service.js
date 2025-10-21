const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên dịch vụ không được để trống'],
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  category: {
    type: String,
    enum: [
      'food_beverage',    // Ăn uống
      'spa_wellness',     // Spa & Wellness  
      'laundry',          // Giặt ủi
      'transportation',   // Vận chuyển
      'entertainment',    // Giải trí
      'business',         // Dịch vụ business
      'room_service',     // Dịch vụ phòng
      'other'             // Khác
    ],
    required: [true, 'Danh mục dịch vụ không được để trống']
  },
  
  price: {
    type: Number,
    required: [true, 'Giá dịch vụ không được để trống'],
    min: [0, 'Giá dịch vụ không được âm']
  },
  
  unit: {
    type: String,
    enum: ['per_person', 'per_hour', 'per_item', 'per_service', 'per_kg'],
    default: 'per_service'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  availableHours: {
    start: {
      type: String,
      default: '00:00'
    },
    end: {
      type: String, 
      default: '23:59'
    }
  },
  
  maxQuantity: {
    type: Number,
    default: null // null = unlimited
  },
  
  preparationTime: {
    type: Number, // minutes
    default: 0
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  images: [{
    type: String,
    trim: true
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Virtual for category display
serviceSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'food_beverage': '🍽️ Ăn uống',
    'spa_wellness': '💆‍♀️ Spa & Wellness',
    'laundry': '👕 Giặt ủi', 
    'transportation': '🚗 Vận chuyển',
    'entertainment': '🎮 Giải trí',
    'business': '💼 Dịch vụ business',
    'room_service': '🛎️ Dịch vụ phòng',
    'other': '📋 Khác'
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for unit display
serviceSchema.virtual('unitDisplay').get(function() {
  const unitMap = {
    'per_person': 'người',
    'per_hour': 'giờ',
    'per_item': 'món',
    'per_service': 'lần',
    'per_kg': 'kg'
  };
  return unitMap[this.unit] || this.unit;
});

module.exports = mongoose.model('Service', serviceSchema);