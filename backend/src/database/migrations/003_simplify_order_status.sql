-- Migration: Simplify order status to only 3 states
-- Date: 2025-11-29
-- Description: Update order_status ENUM to only have 'preparing', 'delivered', 'cancelled'

USE foodgo;

-- Step 1: Update existing orders to match new status values
-- Convert all non-preparing, non-delivered, non-cancelled orders to 'preparing'
UPDATE orders 
SET order_status = 'preparing' 
WHERE order_status IN ('placed', 'confirmed', 'ready', 'delivering');

-- Step 2: Alter the ENUM to only allow 3 values
-- Note: This requires recreating the column with the new ENUM
ALTER TABLE orders 
MODIFY COLUMN order_status ENUM('preparing', 'delivered', 'cancelled') DEFAULT 'preparing';

-- Verify the changes
SELECT 
    order_status, 
    COUNT(*) as count 
FROM orders 
GROUP BY order_status;

-- Success message
SELECT 'Order status simplified to: preparing, delivered, cancelled' AS message;
