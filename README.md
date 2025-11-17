# 🍔 FoodGo - Food Delivery App

> Ứng dụng giao đồ ăn offline-first được xây dựng với React Native và Node.js

## 📋 Mô Tả Dự Án

**FoodGo** là một ứng dụng giao đồ ăn được thiết kế để hoạt động tốt ngay cả khi offline. Ứng dụng cung cấp trải nghiệm đặt đồ ăn hoàn chỉnh với danh mục nhà hàng, giỏ hàng, thanh toán và theo dõi đơn hàng.

## ⏰ Timeline

**Thời gian:** Tháng 12/2025 - Tháng 3/2026 (4 tháng)

## 🎯 Tính Năng Chính

- ✅ **Danh mục nhà hàng** - Xem danh sách và tìm kiếm nhà hàng
- ✅ **Menu** - Xem thực đơn chi tiết của từng nhà hàng
- ✅ **Giỏ hàng** - Thêm, xóa và quản lý đơn hàng
- ✅ **Mã giảm giá** - Áp dụng coupon để được giảm giá
- ✅ **Thanh toán** - Đặt hàng và chọn địa chỉ giao hàng
- ✅ **Sổ địa chỉ** - Lưu và quản lý địa chỉ giao hàng
- ✅ **Theo dõi đơn hàng** - Timeline: Đã đặt → Đang chuẩn bị → Sẵn sàng → Đã giao
- ✅ **Yêu thích** - Lưu nhà hàng và món ăn yêu thích
- ✅ **Đánh giá** - Đánh giá nhà hàng và món ăn
- ✅ **Lịch sử đơn hàng** - Xem các đơn hàng đã đặt
- ✅ **Offline-first** - Hoạt động offline và đồng bộ khi có mạng

## 🛠 Công Nghệ Sử Dụng

### Frontend (Mobile App)
- **Framework:** React Native
- **Language:** JavaScript/TypeScript
- **Navigation:** React Navigation
- **State Management:** Context API
- **Local Storage:** AsyncStorage + SQLite
- **HTTP Client:** Axios
- **UI:** React Native Paper

### Backend (API Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** express-validator

## 📁 Cấu Trúc Dự Án

```
FoodGo/
├── frontend/              # React Native App
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # App screens
│   │   ├── navigation/    # Navigation setup
│   │   ├── services/      # API services
│   │   ├── contexts/      # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── database/      # SQLite config
│   │   ├── utils/         # Utilities
│   │   ├── constants/     # Constants
│   │   ├── models/        # Type definitions
│   │   └── assets/        # Images, fonts
│   ├── android/           # Android project
│   ├── ios/              # iOS project
│   └── package.json
│
├── backend/               # Node.js API
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── config/        # Configuration
│   │   ├── utils/         # Helper functions
│   │   ├── validators/    # Input validation
│   │   └── database/      # DB setup & migrations
│   ├── server.js          # Entry point
│   ├── package.json
│   └── .env              # Environment variables
│
└── docs/                  # Documentation
    ├── API.md             # API documentation
    ├── DATABASE_SCHEMA.md # Database schema
    └── DEPLOYMENT.md      # Deployment guide
```

## 🚀 Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống

- Node.js >= 20
- npm hoặc yarn
- MySQL 8.0+
- React Native CLI
- Android Studio (cho Android)
- Xcode (cho iOS - chỉ trên macOS)

### 1. Clone Repository

```bash
git clone https://github.com/Dang-Cao-Cuong/FoodGo.git
cd FoodGo
```

### 2. Setup Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env và cấu hình
# Sửa file .env với thông tin MySQL của bạn

# Tạo database
mysql -u root -p
CREATE DATABASE foodgo;
exit

# Chạy migrations (nếu có)
npm run migrate

# Khởi động server
npm run dev
```

Backend sẽ chạy tại: `http://localhost:3000`

### 3. Setup Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy Metro bundler
npm start

# Chạy trên Android (terminal mới)
npm run android

# Hoặc chạy trên iOS (chỉ macOS)
npm run ios
```

## 🔧 Configuration

### Backend (.env)

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=foodgo

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### Frontend (src/constants/config.ts)

```typescript
export const API_BASE_URL = 'http://localhost:3000/api';
```

## 📚 Documentation

- [Project Plan](PROJECT_PLAN.md) - Kế hoạch chi tiết dự án
- [Folder Structure](FOLDER_STRUCTURE.md) - Cấu trúc thư mục chi tiết
- [API Documentation](docs/API.md) - Tài liệu API endpoints
- [Database Schema](docs/DATABASE_SCHEMA.md) - Cấu trúc database
- [Deployment Guide](docs/DEPLOYMENT.md) - Hướng dẫn deploy

## 🎓 Học Được Gì

- ✅ Phát triển ứng dụng React Native
- ✅ Xây dựng RESTful API với Express.js
- ✅ Làm việc với MySQL database
- ✅ Triển khai JWT authentication
- ✅ Offline-first architecture
- ✅ State management trong React Native
- ✅ Background sync mechanisms
- ✅ SQLite cho local storage

## 📝 Scripts

### Frontend

```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
npm test          # Run tests
npm run lint      # Run linter
```

### Backend

```bash
npm start         # Start production server
npm run dev       # Start development server with nodemon
npm test         # Run tests
```

## 🤝 Contributing

Dự án này là một project cá nhân phục vụ mục đích học tập.

## 📄 License

MIT License

## 👤 Author

**Dang Cao Cuong**

- GitHub: [@Dang-Cao-Cuong](https://github.com/Dang-Cao-Cuong)
- Role: Full-Stack Developer

## 📞 Support

Nếu có bất kỳ câu hỏi nào, vui lòng tạo issue trên GitHub.

---

**Last Updated:** November 15, 2025  
**Version:** 1.0.0  
**Status:** 🚧 In Development
