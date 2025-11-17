/**
 * Image Assets - Load ảnh từ đường dẫn trong database
 */

// Mapping tất cả ảnh trong thư mục restaurants
const restaurantImages: { [key: string]: any } = {
  'burger-king.jpg': require('./restaurants/burger-king.jpg'),
  'pho24.jpg': require('./restaurants/pho24.jpg'),
  'sushi-world.jpg': require('./restaurants/sushi-world.jpg'),
  'sweet-bakery.jpg': require('./restaurants/sweet-bakery.jpg'),
  'coffee-house.jpg': require('./restaurants/coffee-house.jpg'),
};

// Mapping tất cả ảnh trong thư mục menu_items
const menuItemImages: { [key: string]: any } = {
  'whopper.jpg': require('./menu_items/whopper.jpg'),
  'chicken-burger.jpg': require('./menu_items/chicken-burger.jpg'),
  'french-fries.jpg': require('./menu_items/french-fries.jpg'),
  'coca-cola.jpg': require('./menu_items/coca-cola.jpg'),
  'pho-bo.jpg': require('./menu_items/pho-bo.jpg'),
  'pho-ga.jpg': require('./menu_items/pho-ga.jpg'),
  'goi-cuon.jpg': require('./menu_items/goi-cuon.jpg'),
  'tra-da.jpg': require('./menu_items/tra-da.jpg'),
  'salmon-sushi-set.jpg': require('./menu_items/salmon-sushi-set.jpg'),
  'california-roll.jpg': require('./menu_items/california-roll.jpg'),
  'miso-soup.jpg': require('./menu_items/miso-soup.jpg'),
  'green-tea.jpg': require('./menu_items/green-tea.jpg'),
  'chocolate-cake.jpg': require('./menu_items/chocolate-cake.jpg'),
  'croissant.jpg': require('./menu_items/croissant.jpg'),
  'tiramisu.jpg': require('./menu_items/tiramisu.jpg'),
  'cappuccino.jpg': require('./menu_items/cappuccino.jpg'),
  'latte.jpg': require('./menu_items/latte.jpg'),
  'espresso.jpg': require('./menu_items/espresso.jpg'),
  'iced-coffee.jpg': require('./menu_items/iced-coffee.jpg'),
};

/**
 * Lấy ảnh từ đường dẫn trong database
 * @param path - Đường dẫn từ DB: './src/assets/images/restaurants/pho24.jpg' hoặc './src/assets/images/menu_items/pho-bo.jpg'
 * @returns Image source hoặc null
 */
export const getImageFromPath = (path: string | null): any => {
  if (!path) return null;
  
  // Trích xuất tên file từ đường dẫn
  // './src/assets/images/menu_items/pho-bo.jpg' => 'pho-bo.jpg'
  const fileName = path.split('/').pop() || '';
  
  // Tìm ảnh trong mapping (kiểm tra cả 2 thư mục)
  return menuItemImages[fileName] || restaurantImages[fileName] || null;
};

// Helper function cũ (giữ lại để tương thích)
export const getRestaurantImage = (slug: string) => {
  const images: { [key: string]: any } = {
    'burger-king': restaurantImages['burger-king.jpg'],
    'pho-24': restaurantImages['pho24.jpg'],
    'sushi-world': restaurantImages['sushi-world.jpg'],
    'sweet-bakery': restaurantImages['sweet-bakery.jpg'],
    'coffee-house': restaurantImages['coffee-house.jpg'],
  };
  
  return images[slug] || null;
};

export default {
  getImageFromPath,
  getRestaurantImage,
};
