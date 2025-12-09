-- Migration: Remove unused tables
-- Date: 2025-11-29
-- Description: Drop addresses, coupons, and coupon_usage tables that are not used in the application

USE foodgo;

-- Step 1: Drop coupon_usage table first (has foreign keys to coupons)
DROP TABLE IF EXISTS coupon_usage;
SELECT 'Dropped table: coupon_usage' AS message;

-- Step 2: Drop coupons table (has foreign keys from coupon_usage)
DROP TABLE IF EXISTS coupons;
SELECT 'Dropped table: coupons' AS message;

-- Step 3: Drop addresses table
DROP TABLE IF EXISTS addresses;
SELECT 'Dropped table: addresses' AS message;

-- Step 4: Remove unused columns from orders table (one by one, ignore errors if column doesn't exist)
-- MySQL doesn't support DROP COLUMN IF EXISTS, so we'll handle errors in the script

-- Try to drop address_id
SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE orders DROP COLUMN address_id',
    'SELECT "Column address_id does not exist" AS message'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'foodgo' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'address_id'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Try to drop coupon_code
SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE orders DROP COLUMN coupon_code',
    'SELECT "Column coupon_code does not exist" AS message'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'foodgo' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'coupon_code'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Try to drop discount_amount
SET @sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE orders DROP COLUMN discount_amount',
    'SELECT "Column discount_amount does not exist" AS message'
  )
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'foodgo' 
    AND TABLE_NAME = 'orders' 
    AND COLUMN_NAME = 'discount_amount'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Removed unused columns from orders table' AS message;

-- Verify remaining tables
SELECT TABLE_NAME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'foodgo' 
ORDER BY TABLE_NAME;

-- Success message
SELECT 'Unused tables and columns removed successfully!' AS message;
