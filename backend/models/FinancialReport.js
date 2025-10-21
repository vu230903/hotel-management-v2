const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  
  // Doanh thu từ phòng
  roomRevenue: {
    totalBookings: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 }, // %
    averageRoomRate: { type: Number, default: 0 },
    
    byRoomType: [{
      roomType: String,
      bookings: Number,
      revenue: Number,
      occupancyRate: Number
    }]
  },
  
  // Doanh thu từ dịch vụ
  serviceRevenue: {
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    
    byCategory: [{
      category: String,
      orders: Number,
      revenue: Number
    }],
    
    topServices: [{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
      serviceName: String,
      orders: Number,
      revenue: Number
    }]
  },
  
  // Tổng cộng
  summary: {
    totalRevenue: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    totalServiceOrders: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    
    // Thanh toán
    paymentMethods: [{
      method: String, // cash, card, transfer, room_charge
      amount: Number,
      count: Number
    }],
    
    // Trạng thái thanh toán
    paymentStatus: {
      paid: { amount: Number, count: Number },
      pending: { amount: Number, count: Number },
      refunded: { amount: Number, count: Number }
    }
  },
  
  // Chi phí (nếu có)
  expenses: {
    totalExpenses: { type: Number, default: 0 },
    
    byCategory: [{
      category: String, // maintenance, utilities, staff, supplies, marketing, other
      amount: Number,
      description: String
    }]
  },
  
  // Lợi nhuận
  profit: {
    grossProfit: { type: Number, default: 0 }, // revenue - expenses
    netProfit: { type: Number, default: 0 },   // after taxes, etc.
    profitMargin: { type: Number, default: 0 } // %
  },
  
  // Khách hàng
  customerMetrics: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 },
    averageStayDuration: { type: Number, default: 0 }, // days
    
    customerSources: [{
      source: String, // walk-in, online, phone, agent
      count: Number,
      revenue: Number
    }]
  },
  
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
dailyReportSchema.index({ date: -1 });
dailyReportSchema.index({ 'summary.totalRevenue': -1 });
dailyReportSchema.index({ generatedAt: -1 });

// Static methods to generate reports
dailyReportSchema.statics.generateDailyReport = async function(date, userId) {
  const Booking = mongoose.model('Booking');
  const ServiceOrder = mongoose.model('ServiceOrder');
  const Room = mongoose.model('Room');
  const Service = mongoose.model('Service');
  
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  // Get bookings for the date
  const bookings = await Booking.find({
    $or: [
      { checkInDate: { $gte: startDate, $lte: endDate } },
      { checkOutDate: { $gte: startDate, $lte: endDate } },
      { createdAt: { $gte: startDate, $lte: endDate } }
    ],
    status: { $in: ['confirmed', 'checked_in', 'checked_out'] }
  }).populate('room', 'roomType').populate('customer', '_id');
  
  // Get service orders for the date
  const serviceOrders = await ServiceOrder.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $ne: 'cancelled' }
  }).populate('services.service', 'name category');
  
  // Calculate room revenue
  const roomRevenue = {
    totalBookings: bookings.length,
    totalRevenue: bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
    byRoomType: {}
  };
  
  // Group by room type
  const roomTypeStats = {};
  bookings.forEach(booking => {
    const roomType = booking.room?.roomType || 'unknown';
    if (!roomTypeStats[roomType]) {
      roomTypeStats[roomType] = { bookings: 0, revenue: 0 };
    }
    roomTypeStats[roomType].bookings++;
    roomTypeStats[roomType].revenue += booking.totalAmount || 0;
  });
  
  roomRevenue.byRoomType = Object.entries(roomTypeStats).map(([roomType, stats]) => ({
    roomType,
    ...stats,
    occupancyRate: 0 // Calculate based on total rooms of this type
  }));
  
  roomRevenue.averageRoomRate = roomRevenue.totalBookings > 0 
    ? roomRevenue.totalRevenue / roomRevenue.totalBookings 
    : 0;
  
  // Calculate service revenue
  const serviceRevenue = {
    totalOrders: serviceOrders.length,
    totalRevenue: serviceOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    byCategory: {},
    topServices: {}
  };
  
  // Group services by category
  const serviceCategoryStats = {};
  const serviceStats = {};
  
  serviceOrders.forEach(order => {
    order.services.forEach(item => {
      const service = item.service;
      if (service) {
        // By category
        const category = service.category || 'other';
        if (!serviceCategoryStats[category]) {
          serviceCategoryStats[category] = { orders: 0, revenue: 0 };
        }
        serviceCategoryStats[category].orders++;
        serviceCategoryStats[category].revenue += item.price * item.quantity;
        
        // By service
        const serviceId = service._id.toString();
        if (!serviceStats[serviceId]) {
          serviceStats[serviceId] = {
            serviceId: service._id,
            serviceName: service.name,
            orders: 0,
            revenue: 0
          };
        }
        serviceStats[serviceId].orders++;
        serviceStats[serviceId].revenue += item.price * item.quantity;
      }
    });
  });
  
  serviceRevenue.byCategory = Object.entries(serviceCategoryStats).map(([category, stats]) => ({
    category,
    ...stats
  }));
  
  serviceRevenue.topServices = Object.values(serviceStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Calculate summary
  const totalRevenue = roomRevenue.totalRevenue + serviceRevenue.totalRevenue;
  const totalOrders = roomRevenue.totalBookings + serviceRevenue.totalOrders;
  
  const summary = {
    totalRevenue,
    totalBookings: roomRevenue.totalBookings,
    totalServiceOrders: serviceRevenue.totalOrders,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    paymentMethods: [],
    paymentStatus: {
      paid: { amount: 0, count: 0 },
      pending: { amount: 0, count: 0 },
      refunded: { amount: 0, count: 0 }
    }
  };
  
  // Calculate payment stats
  const paymentMethodStats = {};
  const paymentStatusStats = {
    paid: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    refunded: { amount: 0, count: 0 }
  };
  
  [...bookings, ...serviceOrders].forEach(item => {
    const method = item.payment?.method || 'unknown';
    const status = item.payment?.status || 'pending';
    const amount = item.totalAmount || 0;
    
    // Payment methods
    if (!paymentMethodStats[method]) {
      paymentMethodStats[method] = { amount: 0, count: 0 };
    }
    paymentMethodStats[method].amount += amount;
    paymentMethodStats[method].count++;
    
    // Payment status
    if (paymentStatusStats[status]) {
      paymentStatusStats[status].amount += amount;
      paymentStatusStats[status].count++;
    }
  });
  
  summary.paymentMethods = Object.entries(paymentMethodStats).map(([method, stats]) => ({
    method,
    ...stats
  }));
  summary.paymentStatus = paymentStatusStats;
  
  // Customer metrics
  const uniqueCustomers = new Set();
  bookings.forEach(booking => {
    if (booking.customer?._id) {
      uniqueCustomers.add(booking.customer._id.toString());
    }
  });
  
  const customerMetrics = {
    totalCustomers: uniqueCustomers.size,
    newCustomers: 0, // TODO: Calculate based on customer creation date
    returningCustomers: 0, // TODO: Calculate based on previous bookings
    averageStayDuration: bookings.length > 0 
      ? bookings.reduce((sum, booking) => {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          return sum + Math.max(1, duration);
        }, 0) / bookings.length
      : 0,
    customerSources: [
      { source: 'walk-in', count: 0, revenue: 0 },
      { source: 'online', count: 0, revenue: 0 },
      { source: 'phone', count: 0, revenue: 0 }
    ]
  };
  
  // Basic profit calculation (without expenses for now)
  const profit = {
    grossProfit: totalRevenue, // No expenses data yet
    netProfit: totalRevenue,
    profitMargin: 100 // 100% since no expenses
  };
  
  // Create or update report
  const report = await this.findOneAndUpdate(
    { date: startDate },
    {
      date: startDate,
      roomRevenue,
      serviceRevenue,
      summary,
      expenses: { totalExpenses: 0, byCategory: [] },
      profit,
      customerMetrics,
      generatedAt: new Date(),
      generatedBy: userId
    },
    { upsert: true, new: true }
  );
  
  return report;
};

module.exports = mongoose.model('FinancialReport', dailyReportSchema);
