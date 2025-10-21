const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const ServiceOrder = require('../models/ServiceOrder');
const { authenticate, requireAdmin, requireStaff } = require('../middleware/auth');

// @route   GET /api/services/customer
// @desc    Lấy danh sách dịch vụ cho khách hàng (chỉ dịch vụ active)
// @access  Private (Customer)
router.get('/customer', authenticate, async (req, res) => {
  try {
    console.log('👤 GET /api/services/customer called');
    
    const { category, search } = req.query;
    
    // Build filter - only active services
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Get services grouped by category
    const services = await Service.find(filter)
      .select('name description category price unit availableHours maxQuantity preparationTime tags images')
      .sort({ category: 1, name: 1 });
    
    // Group by category
    const servicesByCategory = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
    
    console.log('✅ Services retrieved for customer:', services.length);
    
    res.json({
      success: true,
      data: {
        services,
        servicesByCategory,
        total: services.length
      }
    });
    
  } catch (error) {
    console.error('Get customer services error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách dịch vụ'
    });
  }
});

// @route   GET /api/services
// @desc    Lấy danh sách dịch vụ
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('📋 GET /api/services called');
    console.log('🔍 Query params:', req.query);

    const { 
      category, 
      isActive, // Remove default value
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build filter
    const filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (isActive !== undefined && isActive !== 'all') {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    // If isActive is undefined or 'all', don't filter by isActive (show all)
    
    console.log('🔍 Final filter:', JSON.stringify(filter));
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const services = await Service.find(filter)
      .populate('createdBy', 'fullName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(filter);

    console.log(`📊 Found ${services.length} services (total: ${total})`);
    console.log('🔍 Filter used:', filter);
    console.log('📋 Services data:', services.map(s => ({ id: s._id, name: s.name, category: s.category })));

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách dịch vụ'
    });
  }
});

// @route   GET /api/services/:id
// @desc    Lấy thông tin chi tiết dịch vụ
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    res.json({
      success: true,
      data: service
    });

  } catch (error) {
    console.error('Get service detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin dịch vụ'
    });
  }
});

// @route   POST /api/services
// @desc    Tạo dịch vụ mới
// @access  Private (Admin)
router.post('/', [
  authenticate,
  requireAdmin,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên dịch vụ không được để trống')
    .isLength({ max: 100 })
    .withMessage('Tên dịch vụ không được quá 100 ký tự'),
  body('category')
    .isIn(['food_beverage', 'spa_wellness', 'laundry', 'transportation', 'entertainment', 'business', 'room_service', 'other'])
    .withMessage('Danh mục dịch vụ không hợp lệ'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá dịch vụ phải là số dương'),
  body('unit')
    .optional()
    .isIn(['per_person', 'per_hour', 'per_item', 'per_service', 'per_kg'])
    .withMessage('Đơn vị tính không hợp lệ'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Mô tả không được quá 500 ký tự')
], async (req, res) => {
  try {
    console.log('🛎️ POST /api/services called');
    console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user?.fullName, req.user?._id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      category,
      price,
      unit,
      availableHours,
      maxQuantity,
      preparationTime,
      tags,
      images
    } = req.body;

    // Check duplicate name
    const existingService = await Service.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
    
    if (existingService) {
      console.log('❌ Duplicate service name found:', existingService.name, existingService._id);
      return res.status(400).json({
        success: false,
        message: `Tên dịch vụ "${name}" đã tồn tại. Hãy chọn tên khác.`
      });
    }

    const service = new Service({
      name,
      description,
      category,
      price,
      unit,
      availableHours,
      maxQuantity,
      preparationTime,
      tags,
      images,
      createdBy: req.user._id
    });

    await service.save();
    await service.populate('createdBy', 'fullName');

    console.log('✅ Service created successfully:', service.name, service._id);

    res.status(201).json({
      success: true,
      message: 'Tạo dịch vụ thành công',
      data: service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo dịch vụ'
    });
  }
});

// @route   PUT /api/services/:id
// @desc    Cập nhật dịch vụ
// @access  Private (Admin)
router.put('/:id', [
  authenticate,
  requireAdmin,
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tên dịch vụ không được để trống')
    .isLength({ max: 200 })
    .withMessage('Tên dịch vụ không được quá 200 ký tự'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Giá dịch vụ phải là số')
    .custom(value => {
      if (parseFloat(value) < 0) {
        throw new Error('Giá dịch vụ phải là số dương');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(['food_beverage', 'spa_wellness', 'laundry', 'transportation', 'entertainment', 'business', 'room_service', 'other'])
    .withMessage('Danh mục dịch vụ không hợp lệ'),
  body('unit')
    .optional()
    .isIn(['per_person', 'per_hour', 'per_item', 'per_service', 'per_kg'])
    .withMessage('Đơn vị tính không hợp lệ')
], async (req, res) => {
  try {
    console.log('🔄 PUT /api/services/:id called');
    console.log('📊 Service ID:', req.params.id);
    console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User:', req.user?.fullName, req.user?._id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      console.log('❌ Service not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    console.log('✅ Found service:', service.name, service._id);

    // Check duplicate name if name is being updated
    if (req.body.name && req.body.name !== service.name) {
      const existingService = await Service.findOne({ 
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: service._id }
      });
      
      if (existingService) {
        return res.status(400).json({
          success: false,
          message: 'Tên dịch vụ đã tồn tại'
        });
      }
    }

    // Update fields
    console.log('🔄 Updating fields...');
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        console.log(`  - ${key}: ${service[key]} → ${req.body[key]}`);
        service[key] = req.body[key];
      }
    });

    console.log('💾 Saving service...');
    await service.save();
    await service.populate('createdBy', 'fullName');

    console.log('✅ Service updated successfully:', service.name, service._id);

    res.json({
      success: true,
      message: 'Cập nhật dịch vụ thành công',
      data: service
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật dịch vụ'
    });
  }
});

// @route   DELETE /api/services/:id
// @desc    Xóa dịch vụ
// @access  Private (Admin)
router.delete('/:id', [authenticate, requireAdmin], async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dịch vụ'
      });
    }

    // Check if service is being used in any orders
    const orderCount = await ServiceOrder.countDocuments({
      'services.service': service._id,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa dịch vụ đang được sử dụng trong đơn hàng'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa dịch vụ thành công'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa dịch vụ'
    });
  }
});

// @route   GET /api/services/debug/all
// @desc    Debug - Lấy tất cả services (no filter)
// @access  Private (Admin)
router.get('/debug/all', [authenticate, requireAdmin], async (req, res) => {
  try {
    const allServices = await Service.find({}).select('name category isActive createdAt');
    
    console.log('🔍 ALL SERVICES IN DATABASE:');
    allServices.forEach(service => {
      console.log(`- ${service.name} (${service.category}) - Active: ${service.isActive} - ID: ${service._id}`);
    });
    
    res.json({
      success: true,
      data: {
        count: allServices.length,
        services: allServices
      }
    });
  } catch (error) {
    console.error('Debug services error:', error);
    res.status(500).json({ success: false, message: 'Debug error' });
  }
});

// @route   GET /api/services/categories/list
// @desc    Lấy danh sách categories
// @access  Private
router.get('/categories/list', authenticate, async (req, res) => {
  try {
    const categories = [
      { value: 'food_beverage', label: '🍽️ Ăn uống', icon: '🍽️' },
      { value: 'spa_wellness', label: '💆‍♀️ Spa & Wellness', icon: '💆‍♀️' },
      { value: 'laundry', label: '👕 Giặt ủi', icon: '👕' },
      { value: 'transportation', label: '🚗 Vận chuyển', icon: '🚗' },
      { value: 'entertainment', label: '🎮 Giải trí', icon: '🎮' },
      { value: 'business', label: '💼 Dịch vụ business', icon: '💼' },
      { value: 'room_service', label: '🛎️ Dịch vụ phòng', icon: '🛎️' },
      { value: 'other', label: '📋 Khác', icon: '📋' }
    ];

    // Get counts for each category
    const categoryCounts = await Service.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    categoryCounts.forEach(item => {
      countMap[item._id] = item.count;
    });

    const categoriesWithCounts = categories.map(cat => ({
      ...cat,
      count: countMap[cat.value] || 0
    }));

    res.json({
      success: true,
      data: categoriesWithCounts
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách danh mục'
    });
  }
});

module.exports = router;