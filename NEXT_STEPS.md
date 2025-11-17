# 🚀 Hướng Dẫn: Các Bước Tiếp Theo

**Ngày:** November 15, 2025  
**Trạng thái:** Database đã tạo, cần test và setup tables

---

## ✅ Đã Hoàn Thành

- [x] Tạo database `foodgo` trong MySQL
- [x] Tạo file database schema documentation
- [x] Tạo SQL migration script
- [x] Tạo database connection config
- [x] Tạo error handler middleware
- [x] Cập nhật server.js

---

## 🎯 Các Bước Tiếp Theo (Thực Hiện Ngay)

### Bước 1: Cập Nhật File .env

Mở file `backend\.env` và sửa dòng sau với mật khẩu MySQL của bạn:

```env
DB_PASSWORD=your_password  # Thay your_password bằng mật khẩu MySQL thực tế
```

Ví dụ:
```env
DB_PASSWORD=Abc123456!
```

---

### Bước 2: Chạy SQL Script Để Tạo Tables

**Option A: Sử dụng MySQL Command Line**

```powershell
# Chạy trong PowerShell
cd C:\code\mobie\FoodGo
mysql -u root -p foodgo < backend\src\database\schema.sql
```

Nhập mật khẩu MySQL khi được yêu cầu.

**Option B: Sử dụng MySQL Workbench**

1. Mở MySQL Workbench
2. Connect tới database
3. Mở file `backend/src/database/schema.sql`
4. Click "Execute" (⚡ icon)
5. Kiểm tra xem 11 tables đã được tạo chưa

**Option C: Sử dụng DBeaver/HeidiSQL**

1. Connect tới database `foodgo`
2. Import file SQL: `backend/src/database/schema.sql`
3. Execute script

---

### Bước 3: Kiểm Tra Tables Đã Tạo

Chạy trong MySQL:

```sql
USE foodgo;
SHOW TABLES;
```

Bạn sẽ thấy 11 tables:
- addresses
- categories
- coupon_usage
- coupons
- favorites
- menu_items
- order_items
- orders
- restaurants
- reviews
- users

---

### Bước 4: Test Backend Server

```powershell
# Di chuyển vào thư mục backend
cd backend

# Chạy server với nodemon (auto-reload)
npm run dev
```

**Kết quả mong đợi:**

```
FoodGo API Server running on http://localhost:3000
Environment: development
✅ MySQL Database connected successfully
```

Nếu kết nối thành công, bạn sẽ thấy message "✅ MySQL Database connected successfully"

---

### Bước 5: Test API Endpoint

Mở browser hoặc Postman và truy cập:

```
http://localhost:3000/
```

Kết quả:
```json
{
  "message": "FoodGo API Server",
  "version": "1.0.0",
  "status": "running"
}
```

---

## 🐛 Troubleshooting

### Lỗi: Cannot connect to MySQL

**Giải pháp:**
1. Kiểm tra MySQL service đang chạy
2. Kiểm tra username/password trong `.env`
3. Kiểm tra MySQL port (default: 3306)
4. Thử connect bằng MySQL Workbench để verify credentials

### Lỗi: ER_NOT_SUPPORTED_AUTH_MODE

**Giải pháp:**
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Lỗi: Database does not exist

**Giải pháp:**
```sql
CREATE DATABASE foodgo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 📋 Checklist Hoàn Thành Bước Này

- [ ] File `.env` đã được cập nhật với password đúng
- [ ] SQL script đã chạy thành công
- [ ] 11 tables đã được tạo trong database
- [ ] Backend server chạy không lỗi
- [ ] Database connection message hiển thị ✅
- [ ] Health check endpoint trả về response

---

## 🎯 Sau Khi Hoàn Thành

### Tiếp Theo: Install Frontend Dependencies

```powershell
cd frontend
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage
npm install react-native-sqlite-storage
npm install axios
npm install react-native-paper
npm install react-native-vector-icons
```

### Sau Đó: Tạo Authentication APIs (Week 3)

- User registration endpoint
- Login endpoint
- JWT authentication
- Password hashing

---

## 📊 Tiến Độ Hiện Tại

| Phase | Status | Progress |
|-------|--------|----------|
| Week 1: Project Setup | ✅ Complete | 100% |
| Week 2: Database Setup | 🚧 In Progress | 70% |
| Week 3: Authentication | ⏳ Upcoming | 0% |

---

## 📞 Cần Giúp Đỡ?

Nếu gặp vấn đề, kiểm tra:
1. Logs trong terminal
2. MySQL error logs
3. File .env configuration
4. MySQL service status

---

**Tạo:** November 15, 2025  
**Cập nhật:** November 15, 2025
