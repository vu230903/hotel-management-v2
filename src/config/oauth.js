// OAuth Configuration
// Cần cấu hình các credentials thực tế từ Google Console và Facebook Developers

export const OAUTH_CONFIG = {
  google: {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
    // Để lấy Google Client ID:
    // 1. Truy cập https://console.cloud.google.com/
    // 2. Tạo project mới hoặc chọn project hiện có
    // 3. Bật Google Identity API
    // 4. Tạo OAuth 2.0 Client ID (Web application)
    // 5. Thêm http://localhost:3000 vào authorized origins
    // 6. Copy Client ID và paste vào .env file
  },
  
  facebook: {
    appId: process.env.REACT_APP_FACEBOOK_APP_ID || '1234567890123456',
    // Để lấy Facebook App ID:
    // 1. Truy cập https://developers.facebook.com/
    // 2. Tạo app mới (Consumer type)
    // 3. Thêm Facebook Login product
    // 4. Cấu hình Valid OAuth Redirect URIs: http://localhost:3000
    // 5. Copy App ID và paste vào .env file
  }
};

// Development mode - sử dụng test credentials
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 OAuth Development Mode');
  console.log('📝 Cần cấu hình OAuth credentials:');
  console.log('1. Tạo file .env trong root folder');
  console.log('2. Thêm REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id');
  console.log('3. Thêm REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id');
}

export default OAUTH_CONFIG;
