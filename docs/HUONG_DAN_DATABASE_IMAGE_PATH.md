# Hướng Dẫn Sử Dụng Hình Ảnh Từ Database Path

## 🎯 Cách hoạt động

Database lưu đường dẫn → App load ảnh từ assets folder

```
Database: './src/assets/images/restaurants/pho24.jpg'
         ↓
App tự động load từ: frontend/src/assets/images/restaurants/pho24.jpg
```

## 📝 Bước 1: Thêm ảnh vào thư mục

Copy file ảnh vào:
```
C:\code\mobie\FoodGo\frontend\src\assets\images\restaurants\
```

Ví dụ:
- `burger-king.jpg`
- `pho24.jpg`
- `sushi-world.jpg`

## 📝 Bước 2: Update mapping trong index.ts

Mở file `frontend/src/assets/images/index.ts` và thêm ảnh mới:

```typescript
const restaurantImages: { [key: string]: any } = {
  'burger-king.jpg': require('./restaurants/burger-king.jpg'),
  'pho24.jpg': require('./restaurants/pho24.jpg'),
  'new-restaurant.jpg': require('./restaurants/new-restaurant.jpg'), // ← Thêm dòng này
};
```

## 📝 Bước 3: Update database

### Cách 1: Chạy SQL script có sẵn

```bash
# Vào thư mục backend
cd C:\code\mobie\FoodGo\backend

# Chạy migration
node scripts/migrate.js
```

File SQL: `backend/src/database/migrations/update_restaurant_images.sql`

### Cách 2: Chạy SQL trực tiếp

Mở MySQL Workbench hoặc phpMyAdmin và chạy:

```sql
UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/pho24.jpg',
  logo_url = './src/assets/images/restaurants/pho24.jpg'
WHERE slug = 'pho-24';
```

## 📝 Bước 4: Kiểm tra

Reload app và kiểm tra:
```bash
# Trong Metro bundler, nhấn:
r    # Reload
```

## 🔧 Thêm nhà hàng mới - 4 Bước

### 1. Thêm ảnh vào folder
```
frontend/src/assets/images/restaurants/banh-mi-huynh-hoa.jpg
```

### 2. Update index.ts
```typescript
const restaurantImages: { [key: string]: any } = {
  // ... các ảnh cũ
  'banh-mi-huynh-hoa.jpg': require('./restaurants/banh-mi-huynh-hoa.jpg'),
};
```

### 3. Insert restaurant vào database
```sql
INSERT INTO restaurants (name, slug, cover_url, logo_url, ...) 
VALUES (
  'Bánh Mì Huỳnh Hoa',
  'banh-mi-huynh-hoa',
  './src/assets/images/restaurants/banh-mi-huynh-hoa.jpg',
  './src/assets/images/restaurants/banh-mi-huynh-hoa.jpg',
  ...
);
```

### 4. Reload app
```
Nhấn 'r' trong Metro bundler
```

## 📊 Format đường dẫn trong database

### ✅ ĐÚNG
```
'./src/assets/images/restaurants/pho24.jpg'
'./src/assets/images/restaurants/burger-king.jpg'
```

### ❌ SAI
```
'src/assets/images/restaurants/pho24.jpg'           // Thiếu ./
'/src/assets/images/restaurants/pho24.jpg'          // Dư /
'frontend/src/assets/images/restaurants/pho24.jpg'  // Dư frontend
'./restaurants/pho24.jpg'                           // Thiếu path đầy đủ
```

## 🎨 Chuẩn bị ảnh

### Kích thước khuyến nghị:
- **Cover image**: 800x400 px (tỉ lệ 2:1)
- **Logo**: 200x200 px (vuông)

### Format:
- `.jpg` - cho ảnh thật (nhẹ hơn)
- `.png` - cho logo có nền trong suốt

### Dung lượng:
- < 500KB mỗi ảnh

## 💡 Ưu điểm của phương pháp này

### ✅ Không cần server hosting ảnh
- Ảnh nằm trong app bundle
- Không tốn băng thông
- Load nhanh hơn

### ✅ Dễ quản lý
- Tất cả ảnh ở 1 chỗ
- Dễ backup
- Dễ version control

### ✅ Linh hoạt
- Có thể mix local + URL
- Fallback khi không tìm thấy
- Dễ thêm/sửa/xóa

## 🐛 Troubleshooting

### Lỗi: "Unable to resolve module"
**Nguyên nhân:** File ảnh không tồn tại hoặc tên sai

**Giải pháp:**
1. Check file có tồn tại không
2. Check tên file trong `index.ts` có đúng không
3. Reload Metro: Ctrl+C rồi `npm start`

### Lỗi: Ảnh không hiển thị (placeholder)
**Nguyên nhân:** Path trong database không khớp với tên file

**Debug:**
```typescript
// Thêm log để debug
const localImage = getImageFromPath(restaurant.cover_url || null);
console.log('Path from DB:', restaurant.cover_url);
console.log('Local image:', localImage);
```

**Giải pháp:**
1. Check path trong database
2. Check tên file có đúng không
3. Check đã thêm vào mapping chưa

### Lỗi: TypeScript error
```
Type 'undefined' is not assignable to type 'string | null'
```

**Giải pháp:** Đã fix trong code
```typescript
getImageFromPath(restaurant.cover_url || null)
```

## 📚 Ví dụ đầy đủ

### Database:
```sql
-- restaurants table
id | name        | slug        | cover_url
1  | Burger King | burger-king | ./src/assets/images/restaurants/burger-king.jpg
2  | Pho 24      | pho-24      | ./src/assets/images/restaurants/pho24.jpg
```

### File structure:
```
frontend/src/assets/images/
  └── restaurants/
      ├── burger-king.jpg     ← File thật
      └── pho24.jpg           ← File thật
```

### index.ts:
```typescript
const restaurantImages = {
  'burger-king.jpg': require('./restaurants/burger-king.jpg'),
  'pho24.jpg': require('./restaurants/pho24.jpg'),
};
```

### App tự động:
```
DB: './src/assets/images/restaurants/burger-king.jpg'
  ↓ Extract filename
  'burger-king.jpg'
  ↓ Find in mapping
  require('./restaurants/burger-king.jpg')
  ↓ Load image
  ✅ Hiển thị ảnh
```

## 🎓 Tổng kết

1. **Thêm ảnh** → `frontend/src/assets/images/restaurants/`
2. **Update mapping** → `index.ts`
3. **Update database** → SQL script
4. **Reload app** → Xong!

**Đơn giản, dễ maintain, phù hợp cho project học tập!** 🎉
