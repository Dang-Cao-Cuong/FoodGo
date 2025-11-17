# Hướng Dẫn Thêm Hình Ảnh - Dành Cho Beginner

## 📁 Cấu trúc thư mục

```
frontend/src/assets/images/
  └── restaurants/
      ├── burger-king.jpg
      ├── pho24.jpg
      ├── sushi-world.jpg
      ├── sweet-bakery.jpg
      └── coffee-house.jpg
```

## 🎯 Bước 1: Tải hình ảnh

1. Mở Google và search:
   - "burger king logo"
   - "pho 24 restaurant"
   - "sushi restaurant"
   - "bakery shop"
   - "coffee shop"

2. Tải ảnh về (kích thước khuyến nghị: 400x200 hoặc 800x400)

3. Đổi tên file theo đúng quy tắc:
   - ❌ Sai: `Burger King.jpg`, `PHO 24.PNG`
   - ✅ Đúng: `burger-king.jpg`, `pho24.jpg`

## 🎯 Bước 2: Copy vào thư mục

Copy tất cả file vào:
```
C:\code\mobie\FoodGo\frontend\src\assets\images\restaurants\
```

## 🎯 Bước 3: Kiểm tra

Mở app và kiểm tra xem ảnh đã hiển thị chưa. Nếu không thấy ảnh:

### Debug checklist:
- ✅ Tên file có đúng không? (xem trong `index.ts`)
- ✅ File có nằm đúng thư mục không?
- ✅ Đã reload app chưa? (nhấn `r` trong Metro bundler)

## 📋 Danh sách tên file cần thiết

| Nhà hàng | Tên file cần đặt | Slug trong DB |
|----------|------------------|---------------|
| Burger King | `burger-king.jpg` | burger-king |
| Pho 24 | `pho24.jpg` | pho-24 |
| Sushi World | `sushi-world.jpg` | sushi-world |
| Sweet Bakery | `sweet-bakery.jpg` | sweet-bakery |
| Coffee House | `coffee-house.jpg` | coffee-house |

## 🔧 Thêm nhà hàng mới

Nếu muốn thêm nhà hàng mới, làm theo 3 bước:

### 1. Thêm ảnh vào thư mục restaurants
```
new-restaurant.jpg
```

### 2. Cập nhật file `index.ts`
```typescript
export const getRestaurantImage = (slug: string) => {
  const images: { [key: string]: any } = {
    'burger-king': require('./restaurants/burger-king.jpg'),
    'pho-24': require('./restaurants/pho24.jpg'),
    'new-restaurant': require('./restaurants/new-restaurant.jpg'), // ← Thêm dòng này
  };
  
  return images[slug] || null;
};
```

### 3. Đảm bảo slug trong database khớp
```sql
-- Slug phải giống với key trong index.ts
INSERT INTO restaurants (slug, name, ...) 
VALUES ('new-restaurant', 'New Restaurant', ...);
```

## 💡 Tips cho Beginner

### 1. Tìm ảnh đẹp miễn phí
- **Unsplash**: https://unsplash.com/s/photos/restaurant
- **Pexels**: https://www.pexels.com/search/food/
- **Pixabay**: https://pixabay.com/images/search/restaurant/

### 2. Resize ảnh (nếu file quá lớn)
- Online: https://www.iloveimg.com/resize-image
- Kích thước khuyến nghị: 800x400 pixels
- Dung lượng: < 500KB

### 3. Chuyển đổi format
- Nên dùng: `.jpg` (cho ảnh thật), `.png` (cho logo)
- Tránh: `.bmp`, `.tiff` (file quá nặng)

### 4. Reload app sau khi thêm ảnh
```bash
# Trong Metro bundler terminal, nhấn:
r    # Reload
```

## 🐛 Xử lý lỗi thường gặp

### Lỗi: "Unable to resolve module"
```
Error: Unable to resolve module ./restaurants/burger-king.jpg
```
**Giải pháp:**
- Kiểm tra tên file có đúng không
- Kiểm tra file có tồn tại không
- Reload Metro bundler: Ctrl+C rồi chạy lại `npm start`

### Lỗi: Ảnh không hiển thị
```
[Ảnh bị trắng hoặc placeholder]
```
**Giải pháp:**
- Mở file `index.ts` kiểm tra slug có khớp không
- Check console log xem có lỗi không
- Thử dùng ảnh khác (có thể file ảnh bị lỗi)

### Lỗi: Ảnh bị méo
```
[Ảnh bị kéo dãn hoặc cắt lạ]
```
**Giải pháp:**
- Thay đổi `resizeMode` trong component:
  - `cover`: Lấp đầy, cắt phần thừa
  - `contain`: Hiển thị hết, có thể có viền
  - `stretch`: Kéo dãn (không khuyến nghị)

## 📚 Tài liệu tham khảo

- React Native Image: https://reactnative.dev/docs/image
- Asset Handling: https://reactnative.dev/docs/images
