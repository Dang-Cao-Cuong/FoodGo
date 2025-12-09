-- Query helper: Kiểm tra các menu items và slug của chúng
-- Sử dụng để đối chiếu với tên file ảnh

-- Xem tất cả menu items với slug
SELECT 
    mi.id,
    r.name as restaurant_name,
    mi.name as menu_item_name,
    mi.slug,
    mi.image_url,
    CASE 
        WHEN mi.image_url LIKE './src/assets/images/menu_items/%' THEN '✓ Local'
        WHEN mi.image_url IS NULL THEN '✗ No image'
        ELSE '? URL'
    END as image_status
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
ORDER BY r.name, mi.name;

-- Đếm số lượng items có/chưa có ảnh local
SELECT 
    CASE 
        WHEN image_url LIKE './src/assets/images/menu_items/%' THEN 'Local Images'
        WHEN image_url IS NULL THEN 'No Images'
        ELSE 'External URLs'
    END as status,
    COUNT(*) as count
FROM menu_items
GROUP BY status;

-- Liệt kê items chưa có ảnh local
SELECT 
    mi.id,
    r.name as restaurant_name,
    mi.name as menu_item_name,
    mi.slug,
    mi.image_url
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE mi.image_url NOT LIKE './src/assets/images/menu_items/%' 
   OR mi.image_url IS NULL
ORDER BY r.name, mi.name;
