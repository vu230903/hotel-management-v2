// Load environment variables
require('dotenv').config({ path: './config.env' });

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://<db_username>:<db_password>@hotel-management.5ab7zru.mongodb.net/hotel-management?retryWrites=true&w=majority&appName=hotel-management',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production_123456789',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',

  // CORS Configuration
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dzpcb2hv4',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '144915281376952',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'EZVVPF8iNzORwV1qEIeuPKUdQYk'
};
