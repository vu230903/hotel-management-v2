const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
const config = require('./config');

// Sample services data
const sampleServices = [
  {
    name: 'Cà phê sữa đá',
    description: 'Cà phê sữa đá truyền thống Việt Nam, thơm ngon đậm đà',
    category: 'food_beverage',
    price: 30000,
    unit: 'per_service',
    isActive: true,
    preparationTime: 5,
    tags: ['cà phê', 'đồ uống', 'truyền thống'],
    availableHours: {
      start: '06:00',
      end: '22:00'
    }
  },
  {
    name: 'Bánh mì pate',
    description: 'Bánh mì pate truyền thống với thịt nguội và rau sống',
    category: 'room_service',
    price: 25000,
    unit: 'per_service',
    isActive: true,
    preparationTime: 10,
    tags: ['bánh mì', 'ăn sáng', 'truyền thống'],
    availableHours: {
      start: '06:00',
      end: '10:00'
    }
  },
  {
    name: 'Massage thư giãn',
    description: 'Massage toàn thân 60 phút giúp thư giãn và giảm stress',
    category: 'spa_wellness',
    price: 500000,
    unit: 'per_hour',
    isActive: true,
    preparationTime: 0,
    tags: ['massage', 'thư giãn', 'spa'],
    availableHours: {
      start: '08:00',
      end: '20:00'
    }
  },
  {
    name: 'Giặt ủi quần áo',
    description: 'Dịch vụ giặt ủi quần áo chuyên nghiệp, giao nhận tại phòng',
    category: 'laundry',
    price: 15000,
    unit: 'per_kg',
    isActive: true,
    preparationTime: 120,
    tags: ['giặt ủi', 'vệ sinh', 'tiện ích'],
    maxQuantity: 20,
    availableHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  {
    name: 'Đưa đón sân bay',
    description: 'Dịch vụ đưa đón sân bay bằng xe riêng, thoải mái và an toàn',
    category: 'transportation',
    price: 200000,
    unit: 'per_service',
    isActive: true,
    preparationTime: 30,
    tags: ['đưa đón', 'sân bay', 'xe riêng'],
    availableHours: {
      start: '00:00',
      end: '23:59'
    }
  },
  {
    name: 'Karaoke phòng VIP',
    description: 'Phòng karaoke VIP với hệ thống âm thanh hiện đại, phục vụ đồ uống',
    category: 'entertainment',
    price: 300000,
    unit: 'per_hour',
    isActive: true,
    preparationTime: 15,
    tags: ['karaoke', 'giải trí', 'VIP'],
    maxQuantity: 3,
    availableHours: {
      start: '18:00',
      end: '02:00'
    }
  },
  {
    name: 'Buffet sáng',
    description: 'Buffet sáng với nhiều món ăn đa dạng',
    category: 'food_beverage',
    price: 150000,
    unit: 'per_person',
    isActive: true,
    preparationTime: 0,
    tags: ['buffet', 'ăn sáng', 'đa dạng'],
    availableHours: {
      start: '06:00',
      end: '10:00'
    }
  },
  {
    name: 'Thuê phòng họp',
    description: 'Phòng họp hiện đại với đầy đủ thiết bị projector, wifi tốc độ cao',
    category: 'business',
    price: 500000,
    unit: 'per_hour',
    isActive: true,
    preparationTime: 30,
    tags: ['phòng họp', 'business', 'projector'],
    maxQuantity: 2,
    availableHours: {
      start: '08:00',
      end: '18:00'
    }
  },
  {
    name: 'Dọn phòng đặc biệt',
    description: 'Dịch vụ dọn phòng đặc biệt với tiêu chuẩn cao cấp',
    category: 'room_service',
    price: 100000,
    unit: 'per_service',
    isActive: true,
    preparationTime: 45,
    tags: ['dọn phòng', 'vệ sinh', 'cao cấp'],
    availableHours: {
      start: '08:00',
      end: '16:00'
    }
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found. Creating default admin...');
      
      adminUser = new User({
        fullName: 'Admin User',
        email: 'admin@hotel.com',
        phone: '0123456789',
        password: 'admin123', // Let middleware handle hashing
        role: 'admin',
        isActive: true,
        department: 'management',
        hireDate: new Date(),
        employeeId: 'EMP001'
      });
      
      await adminUser.save();
      console.log('✅ Created admin user:', adminUser.email);
    }

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing services');

    // Create sample services
    const servicesWithCreator = sampleServices.map(service => ({
      ...service,
      createdBy: adminUser._id
    }));

    const createdServices = await Service.insertMany(servicesWithCreator);
    console.log(`✅ Created ${createdServices.length} sample services`);

    // Display created services
    console.log('\n📋 Created Services:');
    createdServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} - ${service.category} - ${service.price.toLocaleString('vi-VN')}đ`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n👤 Admin credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding
seedServices();
