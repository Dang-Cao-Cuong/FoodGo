# FoodGo - Cấu Trúc Thư Mục (Frontend & Backend)

## 📊 Cấu Trúc Hiện Tại

```
FoodGo/
├── FOODGO/                    # ✅ React Native App (Frontend)
│   ├── android/               # Android native code
│   ├── ios/                   # iOS native code
│   ├── __tests__/             # Test files
│   ├── App.tsx                # Main app component
│   ├── package.json           # Frontend dependencies
│   └── ...                    # Config files
├── PROJECT_PLAN.md            # Kế hoạch dự án
└── FOLDER_STRUCTURE.md        # File này
```

---

## 🎯 Cấu Trúc Đề Xuất (Frontend + Backend Riêng Biệt)

### **Option 1: Monorepo (Khuyến nghị)**
Giữ cả Frontend và Backend trong cùng 1 repository:

```
FoodGo/
├── frontend/                  # 📱 React Native App
│   ├── android/
│   ├── ios/
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable components
│   │   ├── screens/           # App screens
│   │   ├── navigation/        # Navigation setup
│   │   ├── services/          # API services
│   │   ├── hooks/             # Custom hooks
│   │   ├── contexts/          # Context providers
│   │   ├── utils/             # Utility functions
│   │   ├── constants/         # Constants & config
│   │   ├── models/            # TypeScript types/interfaces
│   │   ├── assets/            # Images, fonts
│   │   └── database/          # SQLite setup
│   ├── App.tsx
│   ├── package.json
│   └── ...
│
├── backend/                   # 🖥️ Node.js + Express API
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   ├── config/            # Configuration files
│   │   ├── utils/             # Helper functions
│   │   ├── validators/        # Input validation
│   │   └── database/          # Database setup & migrations
│   ├── server.js              # Entry point
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables
│
├── docs/                      # 📚 Documentation
│   ├── API.md                 # API documentation
│   ├── DATABASE_SCHEMA.md     # Database schema
│   └── DEPLOYMENT.md          # Deployment guide
│
├── PROJECT_PLAN.md
├── README.md
└── .gitignore
```

**✅ Ưu điểm:**
- Dễ quản lý code và version control
- Chia sẻ constants/types giữa frontend và backend
- Deploy riêng biệt nhưng vẫn trong 1 repo

---

### **Option 2: Separate Repositories**
Tạo 2 repositories riêng:

```
FoodGo-Frontend/               # Repository 1
└── (React Native code)

FoodGo-Backend/                # Repository 2
└── (Node.js API code)
```

**✅ Ưu điểm:**
- Hoàn toàn độc lập
- Team có thể làm việc riêng biệt
- CI/CD đơn giản hơn

**❌ Nhược điểm:**
- Khó đồng bộ giữa 2 repos
- Phải maintain 2 repos

---

## 🚀 Hướng Dẫn Cài Đặt (Option 1 - Monorepo)

### **Bước 1: Di chuyển Frontend hiện tại**

```powershell
# Tạo thư mục frontend
New-Item -ItemType Directory -Path "frontend"

# Di chuyển tất cả files từ FOODGO vào frontend
Move-Item -Path "FOODGO\*" -Destination "frontend\"

# Xóa thư mục FOODGO cũ
Remove-Item -Path "FOODGO" -Recurse
```

### **Bước 2: Tổ chức lại Frontend**

```powershell
cd frontend

# Tạo thư mục src
New-Item -ItemType Directory -Path "src"

# Tạo các thư mục con
$folders = @(
    "src\components",
    "src\screens",
    "src\navigation",
    "src\services",
    "src\hooks",
    "src\contexts",
    "src\utils",
    "src\constants",
    "src\models",
    "src\assets\images",
    "src\assets\fonts",
    "src\database"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force
}

cd ..
```

### **Bước 3: Tạo Backend**

```powershell
# Tạo thư mục backend
New-Item -ItemType Directory -Path "backend"
cd backend

# Khởi tạo Node.js project
npm init -y

# Cài đặt dependencies
npm install express mysql2 dotenv cors bcrypt jsonwebtoken express-validator

# Cài đặt dev dependencies
npm install -D nodemon

# Tạo cấu trúc thư mục
$backendFolders = @(
    "src",
    "src\controllers",
    "src\models",
    "src\routes",
    "src\middleware",
    "src\config",
    "src\utils",
    "src\validators",
    "src\database"
)

foreach ($folder in $backendFolders) {
    New-Item -ItemType Directory -Path $folder -Force
}

# Tạo file server.js
New-Item -ItemType File -Path "server.js"

# Tạo .env file
New-Item -ItemType File -Path ".env"

cd ..
```

### **Bước 4: Tạo thư mục docs**

```powershell
New-Item -ItemType Directory -Path "docs"
New-Item -ItemType File -Path "docs\API.md"
New-Item -ItemType File -Path "docs\DATABASE_SCHEMA.md"
New-Item -ItemType File -Path "docs\DEPLOYMENT.md"
```

### **Bước 5: Cập nhật .gitignore**

Thêm vào file `.gitignore` ở root:

```
# Frontend
frontend/node_modules/
frontend/.expo/
frontend/.bundle/
frontend/android/app/build/
frontend/ios/Pods/
frontend/ios/build/

# Backend
backend/node_modules/
backend/.env
backend/uploads/
backend/logs/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

---

## 📝 Cấu Trúc Chi Tiết

### **Frontend Structure (React Native)**

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Common components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   ├── restaurant/          # Restaurant-related
│   │   │   ├── RestaurantCard.tsx
│   │   │   └── MenuItemCard.tsx
│   │   ├── cart/                # Cart components
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   └── order/               # Order components
│   │       ├── OrderCard.tsx
│   │       └── OrderTimeline.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── RestaurantDetailScreen.tsx
│   │   ├── cart/
│   │   │   ├── CartScreen.tsx
│   │   │   └── CheckoutScreen.tsx
│   │   ├── orders/
│   │   │   ├── OrderHistoryScreen.tsx
│   │   │   └── OrderDetailScreen.tsx
│   │   └── favorites/
│   │       └── FavoritesScreen.tsx
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx      # Main navigation
│   │   ├── AuthNavigator.tsx     # Auth stack
│   │   └── TabNavigator.tsx      # Bottom tabs
│   │
│   ├── services/
│   │   ├── api.ts                # Axios config
│   │   ├── authService.ts        # Auth API calls
│   │   ├── restaurantService.ts  # Restaurant APIs
│   │   ├── orderService.ts       # Order APIs
│   │   └── syncService.ts        # Offline sync
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useOffline.ts
│   │
│   ├── database/
│   │   ├── schema.ts             # SQLite schema
│   │   ├── queries.ts            # SQL queries
│   │   └── sync.ts               # Sync logic
│   │
│   ├── utils/
│   │   ├── storage.ts            # AsyncStorage helpers
│   │   ├── validation.ts         # Form validation
│   │   └── helpers.ts            # Utility functions
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── api.ts                # API endpoints
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Restaurant.ts
│   │   ├── Order.ts
│   │   └── MenuItem.ts
│   │
│   └── assets/
│       ├── images/
│       └── fonts/
│
├── android/
├── ios/
├── App.tsx
├── index.js
└── package.json
```

### **Backend Structure (Node.js + Express)**

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── userController.js      # User management
│   │   ├── restaurantController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   ├── favoriteController.js
│   │   └── couponController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Restaurant.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Favorite.js
│   │   └── Coupon.js
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── restaurants.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   ├── favorites.js
│   │   └── coupons.js
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   ├── validate.js           # Input validation
│   │   └── upload.js             # File upload
│   │
│   ├── config/
│   │   ├── database.js           # MySQL config
│   │   └── jwt.js                # JWT config
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── email.js
│   │   └── helpers.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── orderValidator.js
│   │   └── reviewValidator.js
│   │
│   └── database/
│       ├── init.sql              # Initial schema
│       ├── seed.sql              # Sample data
│       └── migrations/           # Database migrations
│
├── server.js                     # Entry point
├── package.json
└── .env
```

---

## 🔧 Scripts để chạy dự án

### **Frontend (package.json)**
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "test": "jest",
    "lint": "eslint src/"
  }
}
```

### **Backend (package.json)**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "node src/database/migrate.js"
  }
}
```

---

## 🎯 Lộ Trình Thực Hiện

### ✅ **Phase 1: Setup Cấu Trúc**
- [ ] Di chuyển và tổ chức lại Frontend
- [ ] Tạo Backend structure
- [ ] Setup Git ignore
- [ ] Tạo documentation files

### ✅ **Phase 2: Backend Foundation**
- [ ] Setup Express server
- [ ] Connect MySQL database
- [ ] Create database schema
- [ ] Implement authentication

### ✅ **Phase 3: Frontend Foundation**
- [ ] Organize components
- [ ] Setup navigation
- [ ] Create contexts
- [ ] Setup API service

### ✅ **Phase 4: Integration**
- [ ] Connect Frontend with Backend
- [ ] Test API calls
- [ ] Implement offline storage
- [ ] Setup sync mechanism

---

## 📌 Ghi Chú

**Khuyến nghị:** Sử dụng **Option 1 (Monorepo)** vì:
- Dễ quản lý cho 1 developer
- Code sharing giữa frontend và backend
- Đơn giản hóa deployment
- Phù hợp với project nhỏ/trung bình

**Tiếp theo:** 
1. Chạy các lệnh PowerShell ở trên để tổ chức lại cấu trúc
2. Tạo các file cơ bản cho Backend
3. Bắt đầu implement theo PROJECT_PLAN.md

---

**Last Updated:** November 15, 2025
