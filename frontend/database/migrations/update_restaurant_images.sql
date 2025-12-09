-- Migration: Update restaurant images with local paths
-- Cập nhật đường dẫn hình ảnh cho các nhà hàng

-- Update cover_url và logo_url với đường dẫn local
UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/burger-king.jpg',
  logo_url = './src/assets/images/restaurants/burger-king.jpg'
WHERE slug = 'burger-king';

UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/pho24.jpg',
  logo_url = './src/assets/images/restaurants/pho24.jpg'
WHERE slug = 'pho-24';

UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/sushi-world.jpg',
  logo_url = './src/assets/images/restaurants/sushi-world.jpg'
WHERE slug = 'sushi-world';

UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/sweet-bakery.jpg',
  logo_url = './src/assets/images/restaurants/sweet-bakery.jpg'
WHERE slug = 'sweet-bakery';

UPDATE restaurants 
SET 
  cover_url = './src/assets/images/restaurants/coffee-house.jpg',
  logo_url = './src/assets/images/restaurants/coffee-house.jpg'
WHERE slug = 'coffee-house';

-- Kiểm tra kết quả
SELECT id, name, slug, cover_url, logo_url FROM restaurants;
