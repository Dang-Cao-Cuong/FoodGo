# Hướng Dẫn Setup Ảnh Menu Items - HOÀN CHỈNH

## ✅ Đã hoàn thành cho bạn:

### 1. ✅ Cập nhật `index.ts`
- Đã thêm mapping cho 19 ảnh menu items
- Function `getImageFromPath()` đã hỗ trợ cả restaurants và menu_items

### 2. ✅ Cập nhật Components
- `MenuItemCard.tsx` - Hiển thị ảnh menu items
- `CartItem.tsx` - Hiển thị ảnh trong giỏ hàng
- `RestaurantCard.tsx` - Hiển thị ảnh nhà hàng

### 3. ✅ Tạo SQL Scripts
- `update_menu_items_images.sql` - Update tất cả paths
- `check_menu_items_images.sql` - Check status

## 🎯 Bạn cần làm gì:

### Bước 1: Chạy SQL để update database

Mở MySQL Workbench hoặc phpMyAdmin và chạy:

```sql
-- File: backend/src/database/migrations/update_menu_items_images.sql
-- Copy toàn bộ nội dung và chạy
```

Hoặc chạy từng item:

```sql
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/whopper.jpg'
WHERE slug = 'whopper';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/pho-bo.jpg'
WHERE slug = 'pho-bo';

-- ... tiếp tục với các items khác
```

### Bước 2: Kiểm tra kết quả

```sql
-- Chạy query này để kiểm tra
SELECT 
    mi.name,
    mi.slug,
    mi.image_url,
    CASE 
        WHEN mi.image_url LIKE './src/assets/images/menu_items/%' THEN '✓'
        ELSE '✗'
    END as status
FROM menu_items mi
ORDER BY mi.restaurant_id, mi.name;
```

Kết quả mong đợi: Tất cả items có ✓

### Bước 3: Reload app

```bash
# Trong Metro bundler terminal, nhấn:
r    # Reload
```

### Bước 4: Test

Mở app và kiểm tra:
- ✅ Trang Home - Xem ảnh các món ăn
- ✅ Chi tiết nhà hàng - Xem menu với ảnh
- ✅ Giỏ hàng - Xem ảnh món trong cart
- ✅ Favorites - Xem ảnh món yêu thích

## 📋 Danh sách ảnh và slug tương ứng

### Burger King (restaurant_id: 1)
| Tên món | Slug | File ảnh |
|---------|------|----------|
| Whopper | whopper | whopper.jpg |
| Chicken Burger | chicken-burger | chicken-burger.jpg |
| French Fries | french-fries | french-fries.jpg |
| Coca Cola | coca-cola | coca-cola.jpg |

### Pho 24 (restaurant_id: 2)
| Tên món | Slug | File ảnh |
|---------|------|----------|
| Pho Bo | pho-bo | pho-bo.jpg |
| Pho Ga | pho-ga | pho-ga.jpg |
| Goi Cuon | goi-cuon | goi-cuon.jpg |
| Tra Da | tra-da | tra-da.jpg |

### Sushi World (restaurant_id: 3)
| Tên món | Slug | File ảnh |
|---------|------|----------|
| Salmon Sushi Set | salmon-sushi-set | salmon-sushi-set.jpg |
| California Roll | california-roll | california-roll.jpg |
| Miso Soup | miso-soup | miso-soup.jpg |
| Green Tea | green-tea | green-tea.jpg |

### Sweet Bakery (restaurant_id: 4)
| Tên món | Slug | File ảnh |
|---------|------|----------|
| Chocolate Cake | chocolate-cake | chocolate-cake.jpg |
| Croissant | croissant | croissant.jpg |
| Tiramisu | tiramisu | tiramisu.jpg |

### Coffee House (restaurant_id: 5)
| Tên món | Slug | File ảnh |
|---------|------|----------|
| Cappuccino | cappuccino | cappuccino.jpg |
| Latte | latte | latte.jpg |
| Espresso | espresso | espresso.jpg |
| Iced Coffee | iced-coffee | iced-coffee.jpg |

## 🔧 Thêm menu item mới

Khi thêm món mới, làm theo 4 bước:

### 1. Thêm ảnh vào folder
```
frontend/src/assets/images/menu_items/banh-xeo.jpg
```

### 2. Update index.ts
```typescript
const menuItemImages: { [key: string]: any } = {
  // ... các ảnh cũ
  'banh-xeo.jpg': require('./menu_items/banh-xeo.jpg'),
};
```

### 3. Insert vào database với path
```sql
INSERT INTO menu_items (
  restaurant_id, 
  name, 
  slug, 
  image_url,
  price,
  ...
) VALUES (
  2,  -- Pho 24
  'Banh Xeo', 
  'banh-xeo',
  './src/assets/images/menu_items/banh-xeo.jpg',
  65000,
  ...
);
```

### 4. Reload app
```
Nhấn 'r' trong Metro bundler
```

## 🎨 Quy tắc đặt tên file

### ✅ ĐÚNG
```
pho-bo.jpg          # Lowercase, gạch ngang
chicken-burger.jpg  # Dấu cách → gạch ngang
coca-cola.jpg       # Đơn giản, dễ nhớ
```

### ❌ SAI
```
Pho Bo.jpg          # Có dấu cách và chữ hoa
PHÔ_BÒ.jpg         # Có dấu tiếng Việt
Chicken Burger.JPG  # Đuôi viết hoa
pho bo.png          # Có dấu cách
```

## 📊 Cấu trúc thư mục hoàn chỉnh

```
frontend/src/assets/images/
├── index.ts (✅ Đã update)
├── restaurants/
│   ├── burger-king.jpg
│   ├── pho24.jpg
│   ├── sushi-world.jpg
│   ├── sweet-bakery.jpg
│   └── coffee-house.jpg
└── menu_items/
    ├── whopper.jpg
    ├── chicken-burger.jpg
    ├── french-fries.jpg
    ├── coca-cola.jpg
    ├── pho-bo.jpg
    ├── pho-ga.jpg
    ├── goi-cuon.jpg
    ├── tra-da.jpg
    ├── salmon-sushi-set.jpg
    ├── california-roll.jpg
    ├── miso-soup.jpg
    ├── green-tea.jpg
    ├── chocolate-cake.jpg
    ├── croissant.jpg
    ├── tiramisu.jpg
    ├── cappuccino.jpg
    ├── latte.jpg
    ├── espresso.jpg
    └── iced-coffee.jpg
```

## 🐛 Troubleshooting

### Vấn đề: Một số ảnh hiển thị, một số không

**Debug:**
```sql
-- Check xem slug có đúng không
SELECT name, slug, image_url FROM menu_items;
```

**Nguyên nhân thường gặp:**
1. Slug trong DB khác với key trong `index.ts`
2. Tên file trong folder khác với require() trong code
3. Chưa reload app sau khi update

**Giải pháp:**
1. So sánh slug DB vs tên file
2. Đảm bảo `index.ts` có đúng tên file
3. Reload Metro: Ctrl+C rồi `npm start`

### Vấn đề: "Unable to resolve module"

**Error:**
```
Unable to resolve module ./menu_items/pho-bo.jpg
```

**Nguyên nhân:**
- File không tồn tại hoặc tên sai

**Giải pháp:**
1. Check file có tồn tại: `ls frontend/src/assets/images/menu_items/`
2. Check chính tả trong `index.ts`
3. Restart Metro bundler

### Vấn đề: Ảnh bị méo hoặc không đúng tỉ lệ

**Giải pháp:**
1. Resize ảnh về kích thước chuẩn:
   - Menu items: 300x300px (vuông)
   - Restaurant cover: 800x400px (2:1)
   
2. Dùng tool online: https://www.iloveimg.com/resize-image

3. Đảm bảo `resizeMode="cover"` trong component

## 💡 Tips

### Tìm ảnh food đẹp miễn phí:
- **Unsplash**: https://unsplash.com/s/photos/food
- **Pexels**: https://www.pexels.com/search/food/
- **Foodiesfeed**: https://www.foodiesfeed.com/

### Optimize ảnh:
- Format: JPG cho ảnh thật
- Kích thước: 300x300px cho menu items
- Dung lượng: < 200KB/ảnh
- Tool: https://tinypng.com/

### Backup ảnh:
```bash
# Copy tất cả ảnh ra folder backup
cp -r frontend/src/assets/images backup_images_$(date +%Y%m%d)
```

## 📝 Checklist hoàn thành

- [ ] Đã có 19 ảnh trong `menu_items/` folder
- [ ] Chạy SQL update database
- [ ] Kiểm tra query: Tất cả items có path đúng
- [ ] Reload app (nhấn 'r')
- [ ] Test: Mở app xem các trang
  - [ ] Home screen - Featured items có ảnh
  - [ ] Restaurant detail - Menu items có ảnh
  - [ ] Cart - Items trong giỏ có ảnh
  - [ ] Favorites - Favorite items có ảnh
- [ ] Tất cả ảnh hiển thị đúng, không bị méo

## 🎉 Kết quả mong đợi

Sau khi hoàn thành:
- ✅ Tất cả 19 menu items có ảnh đẹp
- ✅ Ảnh load nhanh từ local
- ✅ Không cần internet để xem ảnh
- ✅ App trông professional hơn
- ✅ Dễ thêm món mới trong tương lai

**Chúc mừng bạn đã hoàn thành setup ảnh cho app!** 🎊
