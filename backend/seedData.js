const mongoose = require('mongoose');
const Room = require('./models/Room');
const Service = require('./models/Service');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@hotel-management.5ab7zru.mongodb.net/hotel-management?retryWrites=true&w=majority&appName=hotel-management';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedRooms = async () => {
  try {
    console.log('🌱 Seeding rooms...');
    
    // Clear existing rooms
    await Room.deleteMany({});
    
    const rooms = [
      {
        roomNumber: '101',
        roomType: 'deluxe',
        description: 'Phòng Deluxe sang trọng với view thành phố tuyệt đẹp, trang bị đầy đủ tiện nghi hiện đại. Không gian rộng rãi và thoải mái, phù hợp cho cả công tác và nghỉ dưỡng.',
        basePrice: 2500000,
        hourlyPrice: {
          firstHour: 150000,
          additionalHour: 30000
        },
        maxOccupancy: 2,
        roomSize: 35,
        amenities: ['wifi', 'tv', 'air_conditioning', 'city_view', 'breakfast'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 1,
        bedType: 'queen'
      },
      {
        roomNumber: '201',
        roomType: 'deluxe',
        description: 'Suite rộng rãi với phòng khách riêng biệt, ban công view panorama và dịch vụ butler. Không gian sang trọng với khu vực làm việc riêng, minibar đầy đủ và hệ thống giải trí cao cấp.',
        basePrice: 4500000,
        hourlyPrice: {
          firstHour: 200000,
          additionalHour: 40000
        },
        maxOccupancy: 4,
        roomSize: 65,
        amenities: ['wifi', 'tv', 'air_conditioning', 'city_view', 'minibar', 'room_service', 'breakfast'],
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 2,
        bedType: 'queen'
      },
      {
        roomNumber: '301',
        roomType: 'presidential',
        description: 'Phòng Presidential cao cấp nhất với không gian cực kỳ rộng rãi, view toàn cảnh thành phố và dịch vụ cá nhân hóa. Bao gồm phòng khách, phòng ngủ master, phòng làm việc riêng và ban công lớn.',
        basePrice: 8000000,
        hourlyPrice: {
          firstHour: 250000,
          additionalHour: 50000
        },
        maxOccupancy: 6,
        roomSize: 120,
        amenities: ['wifi', 'tv', 'air_conditioning', 'city_view', 'minibar', 'room_service', 'jacuzzi', 'breakfast'],
        images: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 3,
        bedType: 'queen'
      },
      {
        roomNumber: '102',
        roomType: 'standard',
        description: 'Phòng Standard tiện nghi với thiết kế hiện đại, phù hợp cho khách du lịch và công tác ngắn hạn. Được trang bị đầy đủ các tiện nghi cơ bản.',
        basePrice: 1800000,
        hourlyPrice: {
          firstHour: 100000,
          additionalHour: 20000
        },
        maxOccupancy: 2,
        roomSize: 25,
        amenities: ['wifi', 'tv', 'air_conditioning', 'breakfast'],
        images: [
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 1,
        bedType: 'queen'
      },
      {
        roomNumber: '202',
        roomType: 'deluxe',
        description: 'Phòng Deluxe với thiết kế sang trọng và view đẹp. Không gian thoải mái với các tiện nghi cao cấp.',
        basePrice: 2800000,
        hourlyPrice: {
          firstHour: 220000,
          additionalHour: 55000
        },
        maxOccupancy: 3,
        roomSize: 40,
        amenities: ['wifi', 'tv', 'air_conditioning', 'city_view', 'minibar'],
        images: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 2,
        bedType: 'queen'
      },
      {
        roomNumber: '103',
        roomType: 'standard',
        description: 'Phòng Standard với giá cả hợp lý và tiện nghi đầy đủ.',
        basePrice: 1600000,
        hourlyPrice: {
          firstHour: 80000,
          additionalHour: 15000
        },
        maxOccupancy: 2,
        roomSize: 22,
        amenities: ['wifi', 'tv', 'air_conditioning', 'breakfast'],
        images: [
          'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&h=600&fit=crop'
        ],
        status: 'available',
        floor: 1,
        bedType: 'queen'
      }
    ];

    const createdRooms = await Room.insertMany(rooms);
    console.log(`✅ Created ${createdRooms.length} rooms`);
    
    return createdRooms;
  } catch (error) {
    console.error('❌ Error seeding rooms:', error);
    throw error;
  }
};

const seedServices = async () => {
  try {
    console.log('🌱 Seeding services...');
    
    // Clear existing services
    await Service.deleteMany({});
    
    // Get admin user for createdBy field
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('Admin user not found. Please seed admin user first.');
    }
    
    const services = [
      {
        name: 'Bữa sáng buffet',
        description: 'Bữa sáng buffet đa dạng với các món ăn Việt Nam và quốc tế',
        category: 'food_beverage',
        price: 200000,
        unit: 'per_person',
        isActive: true,
        availableHours: {
          start: '06:00',
          end: '10:00'
        },
        maxQuantity: 100,
        preparationTime: 0,
        tags: ['breakfast', 'buffet', 'vietnamese', 'international'],
        images: ['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      },
      {
        name: 'Dịch vụ Spa',
        description: 'Massage thư giãn và các liệu pháp spa cao cấp',
        category: 'spa_wellness',
        price: 500000,
        unit: 'per_service',
        isActive: true,
        availableHours: {
          start: '09:00',
          end: '22:00'
        },
        maxQuantity: 20,
        preparationTime: 30,
        tags: ['spa', 'massage', 'relaxation', 'wellness'],
        images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      },
      {
        name: 'Dịch vụ đưa đón sân bay',
        description: 'Xe sang trọng đưa đón từ/đến sân bay',
        category: 'transportation',
        price: 300000,
        unit: 'per_service',
        isActive: true,
        availableHours: {
          start: '00:00',
          end: '23:59'
        },
        maxQuantity: 10,
        preparationTime: 15,
        tags: ['airport', 'transfer', 'luxury', 'transportation'],
        images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      },
      {
        name: 'Dịch vụ phòng 24/7',
        description: 'Dịch vụ phòng 24 giờ với menu đa dạng',
        category: 'room_service',
        price: 150000,
        unit: 'per_item',
        isActive: true,
        availableHours: {
          start: '00:00',
          end: '23:59'
        },
        maxQuantity: 50,
        preparationTime: 20,
        tags: ['room-service', '24h', 'dining', 'convenience'],
        images: ['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      },
      {
        name: 'Thuê xe du lịch',
        description: 'Thuê xe sang trọng để tham quan thành phố',
        category: 'transportation',
        price: 800000,
        unit: 'per_hour',
        isActive: true,
        availableHours: {
          start: '08:00',
          end: '18:00'
        },
        maxQuantity: 5,
        preparationTime: 60,
        tags: ['car-rental', 'tourism', 'luxury', 'transportation'],
        images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      },
      {
        name: 'Tour thành phố',
        description: 'Tour tham quan các điểm nổi tiếng của thành phố',
        category: 'entertainment',
        price: 400000,
        unit: 'per_person',
        isActive: true,
        availableHours: {
          start: '08:00',
          end: '17:00'
        },
        maxQuantity: 30,
        preparationTime: 0,
        tags: ['tour', 'city', 'sightseeing', 'tourism'],
        images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop'],
        createdBy: adminUser._id
      }
    ];

    const createdServices = await Service.insertMany(services);
    console.log(`✅ Created ${createdServices.length} services`);
    
    return createdServices;
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
};

const seedAdminUser = async () => {
  try {
    console.log('🌱 Seeding admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@hotel.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return existingAdmin;
    }
    
    const adminUser = new User({
      fullName: 'Administrator',
      email: 'admin@hotel.com',
      password: 'admin123', // This will be hashed by the pre-save middleware
      role: 'admin',
      phone: '0123456789',
      isActive: true
    });
    
    await adminUser.save();
    console.log('✅ Created admin user');
    
    return adminUser;
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    await seedRooms();
    await seedServices();
    await seedAdminUser();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Rooms: 6 rooms created');
    console.log('- Services: 6 services created');
    console.log('- Admin user: admin@hotel.com / admin123');
    
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
seedData();
