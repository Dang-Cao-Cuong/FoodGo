-- Migration: Update menu_items images with local paths
-- Cập nhật đường dẫn hình ảnh cho các menu items

-- Burger King items
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/whopper.jpg'
WHERE slug = 'whopper';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/chicken-burger.jpg'
WHERE slug = 'chicken-burger';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/french-fries.jpg'
WHERE slug = 'french-fries';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/coca-cola.jpg'
WHERE slug = 'coca-cola';

-- Pho 24 items
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/pho-bo.jpg'
WHERE slug = 'pho-bo';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/pho-ga.jpg'
WHERE slug = 'pho-ga';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/goi-cuon.jpg'
WHERE slug = 'goi-cuon';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/tra-da.jpg'
WHERE slug = 'tra-da';

-- Sushi World items
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/salmon-sushi-set.jpg'
WHERE slug = 'salmon-sushi-set';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/california-roll.jpg'
WHERE slug = 'california-roll';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/miso-soup.jpg'
WHERE slug = 'miso-soup';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/green-tea.jpg'
WHERE slug = 'green-tea';

-- Sweet Bakery items
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/chocolate-cake.jpg'
WHERE slug = 'chocolate-cake';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/croissant.jpg'
WHERE slug = 'croissant';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/tiramisu.jpg'
WHERE slug = 'tiramisu';

-- Coffee House items
UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/cappuccino.jpg'
WHERE slug = 'cappuccino';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/latte.jpg'
WHERE slug = 'latte';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/espresso.jpg'
WHERE slug = 'espresso';

UPDATE menu_items 
SET image_url = './src/assets/images/menu_items/iced-coffee.jpg'
WHERE slug = 'iced-coffee';

-- Kiểm tra kết quả
SELECT id, name, slug, image_url, restaurant_id FROM menu_items ORDER BY restaurant_id;
