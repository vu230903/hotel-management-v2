# Hotel Management System - Backend API

## Tổng quan
Backend API cho hệ thống quản lý khách sạn với 4 loại người dùng:
- **Admin**: Quản lý toàn bộ hệ thống
- **Reception Staff**: Nhân viên lễ tân
- **Customer**: Khách hàng
- **Cleaning Staff**: Nhân viên dọn dẹp

## Công nghệ sử dụng
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** Authentication
- **bcryptjs** cho mã hóa mật khẩu
- **express-validator** cho validation

## Cài đặt

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Cấu hình MongoDB
1. Tạo file `.env` từ `.env.example`
2. Cập nhật `MONGODB_URI` với thông tin kết nối MongoDB Atlas của bạn
3. Cập nhật `JWT_SECRET` với secret key mạnh

### 3. Chạy server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Đăng ký tài khoản
- `POST /login` - Đăng nhập
- `GET /me` - Lấy thông tin user hiện tại
- `POST /change-password` - Đổi mật khẩu
- `POST /logout` - Đăng xuất

### Users (`/api/users`)
- `GET /` - Lấy danh sách users (Admin/Staff)
- `GET /:id` - Lấy thông tin user theo ID
- `PUT /:id` - Cập nhật thông tin user
- `PUT /:id/role` - Thay đổi role (Admin only)
- `PUT /:id/status` - Thay đổi trạng thái user (Admin only)
- `DELETE /:id` - Xóa user (Admin only)

### Rooms (`/api/rooms`)
- `GET /` - Lấy danh sách phòng
- `GET /:id` - Lấy thông tin phòng theo ID
- `POST /` - Tạo phòng mới (Admin/Staff)
- `PUT /:id` - Cập nhật thông tin phòng (Admin/Staff)
- `PUT /:id/status` - Cập nhật trạng thái phòng (Staff)
- `PUT /:id/cleaning-status` - Cập nhật trạng thái dọn dẹp (Cleaning Staff)
- `DELETE /:id` - Xóa phòng (Admin only)

### Bookings (`/api/bookings`)
- `GET /` - Lấy danh sách đặt phòng
- `GET /:id` - Lấy thông tin đặt phòng theo ID
- `POST /` - Tạo đặt phòng mới
- `PUT /:id/status` - Cập nhật trạng thái đặt phòng (Staff)
- `PUT /:id/check-in` - Check-in khách (Staff)
- `PUT /:id/check-out` - Check-out khách (Staff)
- `PUT /:id/cancel` - Hủy đặt phòng

### Services (`/api/services`)
- `GET /` - Lấy danh sách dịch vụ
- `GET /:id` - Lấy thông tin dịch vụ theo ID
- `POST /` - Tạo dịch vụ mới (Admin/Staff)
- `PUT /:id` - Cập nhật thông tin dịch vụ (Admin/Staff)
- `PUT /:id/status` - Cập nhật trạng thái dịch vụ (Admin/Staff)
- `PUT /:id/statistics` - Cập nhật thống kê dịch vụ (Staff)
- `GET /categories/list` - Lấy danh sách danh mục dịch vụ
- `DELETE /:id` - Xóa dịch vụ (Admin only)

## Cấu trúc Database

### User Model
- Thông tin cơ bản: fullName, email, phone, password
- Phân quyền: role (admin, reception, customer, cleaning)
- Thông tin bổ sung: address, dateOfBirth, gender
- Thông tin nhân viên: employeeId, department, hireDate

### Room Model
- Thông tin phòng: roomNumber, floor, roomType, basePrice
- Tiện nghi: amenities, maxOccupancy, bedType, roomSize
- Trạng thái: status, cleaningStatus
- Giá theo mùa: seasonalPricing

### Booking Model
- Thông tin khách: customer, room, checkIn, checkOut
- Số lượng khách: adults, children
- Trạng thái: pending, confirmed, checked_in, checked_out, cancelled
- Thanh toán: method, status, amount
- Dịch vụ bổ sung: additionalServices

### Service Model
- Thông tin dịch vụ: name, description, category, price
- Cấu hình: unit, duration, requirements
- Nhà cung cấp: provider info
- Thống kê: totalBookings, totalRevenue, averageRating

## Authentication

### JWT Token
- Header: `Authorization: Bearer <token>`
- Expire: 7 ngày (có thể cấu hình)
- Secret key: Cấu hình trong `.env`

### Phân quyền
- **Admin**: Toàn quyền truy cập
- **Reception Staff**: Quản lý đặt phòng, check-in/out
- **Customer**: Đặt phòng, xem lịch sử
- **Cleaning Staff**: Cập nhật trạng thái dọn dẹp

## Error Handling
Tất cả API đều trả về response theo format:
```json
{
  "success": boolean,
  "message": string,
  "data": object (optional),
  "errors": array (optional)
}
```

## Validation
Sử dụng `express-validator` để validate input:
- Email format
- Phone number format
- Password strength
- Required fields
- Data types

## CORS
Cấu hình CORS để frontend có thể gọi API:
- Origin: `http://localhost:3000` (có thể cấu hình)
- Credentials: true

## Health Check
- `GET /api/health` - Kiểm tra trạng thái server

## Lưu ý
1. Thay đổi `JWT_SECRET` trong production
2. Cấu hình `MONGODB_URI` với thông tin thực
3. Sử dụng HTTPS trong production
4. Backup database định kỳ
5. Monitor logs và performance
