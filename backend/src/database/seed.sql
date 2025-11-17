-- Sample data for FoodGo database
USE foodgo;

-- Insert Categories
INSERT INTO categories (name, slug, description, icon, display_order, is_active) VALUES
('Fast Food', 'fast-food', 'Quick and delicious fast food', '🍔', 1, TRUE),
('Vietnamese', 'vietnamese', 'Traditional Vietnamese cuisine', '🍜', 2, TRUE),
('Asian', 'asian', 'Delicious Asian dishes', '🍱', 3, TRUE),
('Desserts', 'desserts', 'Sweet treats and desserts', '🍰', 4, TRUE),
('Beverages', 'beverages', 'Refreshing drinks', '🥤', 5, TRUE);

-- Insert Restaurants
INSERT INTO restaurants (name, slug, description, category_id, phone, address, city, district, delivery_fee, min_order_amount, is_featured, is_active) VALUES
('Burger King', 'burger-king', 'Home of the Whopper', 1, '0901234567', '123 Nguyen Hue, District 1', 'Ho Chi Minh', 'District 1', 15000.00, 50000.00, TRUE, TRUE),
('Pho 24', 'pho-24', 'Authentic Vietnamese Pho', 2, '0901234568', '456 Le Loi, District 1', 'Ho Chi Minh', 'District 1', 20000.00, 40000.00, TRUE, TRUE),
('Sushi World', 'sushi-world', 'Fresh sushi and Japanese cuisine', 3, '0901234569', '789 Hai Ba Trung, District 3', 'Ho Chi Minh', 'District 3', 25000.00, 100000.00, FALSE, TRUE),
('Sweet Bakery', 'sweet-bakery', 'Delicious cakes and pastries', 4, '0901234570', '321 Tran Hung Dao, District 5', 'Ho Chi Minh', 'District 5', 15000.00, 30000.00, TRUE, TRUE),
('Coffee House', 'coffee-house', 'Best coffee in town', 5, '0901234571', '654 Ly Tu Trong, District 1', 'Ho Chi Minh', 'District 1', 10000.00, 20000.00, FALSE, TRUE);

-- Insert Menu Items for Burger King
INSERT INTO menu_items (restaurant_id, name, slug, description, price, category, is_available, is_featured) VALUES
(1, 'Whopper', 'whopper', 'Classic flame-grilled burger', 89000.00, 'Main Course', TRUE, TRUE),
(1, 'Chicken Burger', 'chicken-burger', 'Crispy chicken burger', 79000.00, 'Main Course', TRUE, FALSE),
(1, 'French Fries', 'french-fries', 'Golden crispy fries', 35000.00, 'Appetizer', TRUE, FALSE),
(1, 'Coca Cola', 'coca-cola', 'Refreshing soft drink', 25000.00, 'Beverage', TRUE, FALSE);

-- Insert Menu Items for Pho 24
INSERT INTO menu_items (restaurant_id, name, slug, description, price, category, is_available, is_featured) VALUES
(2, 'Pho Bo', 'pho-bo', 'Beef noodle soup', 75000.00, 'Main Course', TRUE, TRUE),
(2, 'Pho Ga', 'pho-ga', 'Chicken noodle soup', 65000.00, 'Main Course', TRUE, TRUE),
(2, 'Goi Cuon', 'goi-cuon', 'Fresh spring rolls', 45000.00, 'Appetizer', TRUE, FALSE),
(2, 'Tra Da', 'tra-da', 'Iced tea', 15000.00, 'Beverage', TRUE, FALSE);

-- Insert Menu Items for Sushi World
INSERT INTO menu_items (restaurant_id, name, slug, description, price, category, is_available, is_featured) VALUES
(3, 'Salmon Sushi Set', 'salmon-sushi-set', '8 pieces of fresh salmon sushi', 180000.00, 'Main Course', TRUE, TRUE),
(3, 'California Roll', 'california-roll', 'Classic California roll', 120000.00, 'Main Course', TRUE, FALSE),
(3, 'Miso Soup', 'miso-soup', 'Traditional miso soup', 35000.00, 'Appetizer', TRUE, FALSE),
(3, 'Green Tea', 'green-tea', 'Japanese green tea', 20000.00, 'Beverage', TRUE, FALSE);

-- Insert Menu Items for Sweet Bakery
INSERT INTO menu_items (restaurant_id, name, slug, description, price, category, is_available, is_featured) VALUES
(4, 'Chocolate Cake', 'chocolate-cake', 'Rich chocolate cake', 95000.00, 'Dessert', TRUE, TRUE),
(4, 'Tiramisu', 'tiramisu', 'Italian tiramisu', 85000.00, 'Dessert', TRUE, FALSE),
(4, 'Croissant', 'croissant', 'Buttery French croissant', 45000.00, 'Dessert', TRUE, FALSE);

-- Insert Menu Items for Coffee House
INSERT INTO menu_items (restaurant_id, name, slug, description, price, category, is_available, is_featured) VALUES
(5, 'Cappuccino', 'cappuccino', 'Classic cappuccino', 55000.00, 'Beverage', TRUE, TRUE),
(5, 'Latte', 'latte', 'Smooth latte', 50000.00, 'Beverage', TRUE, FALSE),
(5, 'Espresso', 'espresso', 'Strong espresso shot', 40000.00, 'Beverage', TRUE, FALSE),
(5, 'Iced Coffee', 'iced-coffee', 'Vietnamese iced coffee', 45000.00, 'Beverage', TRUE, TRUE);

-- Insert Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, valid_from, valid_until, is_active) VALUES
('WELCOME10', 'Welcome discount for new users', 'percentage', 10.00, 50000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('FREESHIP', 'Free shipping on orders above 100k', 'fixed_amount', 20000.00, 100000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE),
('SAVE50K', '50k off on orders above 200k', 'fixed_amount', 50000.00, 200000.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), TRUE);

SELECT 'Sample data inserted successfully!' AS message;
SELECT 
  (SELECT COUNT(*) FROM categories) AS categories,
  (SELECT COUNT(*) FROM restaurants) AS restaurants,
  (SELECT COUNT(*) FROM menu_items) AS menu_items,
  (SELECT COUNT(*) FROM coupons) AS coupons;
