# 🏨 Hotel Management Mobile App

Mobile app cho khách hàng và nhân viên dọn dẹp của hệ thống quản lý khách sạn.

## 📱 Features

### 👥 Customer App (Khách hàng)
- ✅ Đăng nhập/đăng xuất
- ✅ Xem danh sách đặt phòng
- ✅ Chi tiết booking
- ✅ Check-in/Check-out
- ✅ Thanh toán

### 🧹 Cleaning Staff App (Nhân viên dọn dẹp)
- ✅ Đăng nhập/đăng xuất
- ✅ Xem phòng cần dọn dẹp
- ✅ Cập nhật trạng thái dọn dẹp
- ✅ Báo cáo hoàn thành

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Backend API running on `http://localhost:5000`

### Installation
```bash
cd mobile
npm install
```

### Development
```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Testing on Device
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will load on your device

## 🏗️ Architecture

```
mobile/
├── src/
│   ├── contexts/          # React Context (Auth)
│   ├── services/          # API services
│   ├── screens/           # App screens
│   │   ├── auth/          # Login screens
│   │   ├── customer/      # Customer screens
│   │   └── cleaning/      # Cleaning staff screens
│   └── components/        # Reusable components
├── App.tsx                # Main app component
└── package.json
```

## 🔗 Backend Integration

Mobile app sử dụng cùng backend API với web app:
- **Auth**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- **Bookings**: `/api/bookings`, `/api/bookings/:id/status`, `/api/bookings/:id/check-in`, `/api/bookings/:id/check-out`
- **Rooms**: `/api/rooms`, `/api/rooms/:id`, `/api/rooms/:id/cleaning-status`
- **Cleaning**: `/api/rooms?status=needs_cleaning`, `/api/rooms/:id/cleaning-status`

## 📱 Platform Support

- ✅ **Android** (APK build)
- ✅ **iOS** (IPA build)
- ✅ **Web** (PWA)
- ✅ **Expo Go** (Development)

## 🎯 User Roles

### Customer (Khách hàng)
- Đặt phòng
- Xem booking
- Check-in/out
- Thanh toán

### Cleaning Staff (Nhân viên dọn dẹp)
- Xem phòng cần dọn
- Cập nhật trạng thái
- Báo cáo hoàn thành

## 🔧 Development

### Adding New Screens
1. Create screen component in `src/screens/`
2. Add to navigation in `App.tsx`
3. Update role-based routing

### API Integration
1. Add new API calls in `src/services/api.ts`
2. Use in screen components
3. Handle loading/error states

## 📦 Build & Deploy

### Development Build
```bash
expo build:android
expo build:ios
expo build:web
```

### Production Build
```bash
expo build:android --type apk
expo build:ios --type archive
```

## 🎨 UI/UX

- **Material Design** principles
- **Responsive** layout
- **Dark/Light** theme support
- **Accessibility** features

## 🔐 Security

- **JWT Token** authentication
- **Secure storage** for credentials
- **API encryption** in transit
- **Role-based** access control

## 📊 Performance

- **Lazy loading** for screens
- **Image optimization**
- **Bundle splitting**
- **Caching** strategies

## 🐛 Troubleshooting

### Common Issues
1. **Metro bundler** not starting
2. **Expo Go** connection issues
3. **API** connection errors
4. **Build** failures

### Solutions
```bash
# Clear cache
expo start --clear

# Reset Metro
npx react-native start --reset-cache

# Reinstall dependencies
rm -rf node_modules && npm install
```

## 📞 Support

For issues and questions:
- Check [Expo Documentation](https://docs.expo.dev/)
- Review [React Navigation](https://reactnavigation.org/)
- Contact development team

---

**Built with ❤️ using Expo + React Native**
