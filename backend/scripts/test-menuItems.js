const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'foodgo',
};

let adminToken = '';
let testRestaurantId = null;
let testMenuItemId = null;
let pool;

// Test counters
let totalTests = 0;
let passedTests = 0;

// Helper function to log test results
function logTest(testName, passed, error = null) {
  totalTests++;
  if (passed) {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.log(`❌ FAIL: ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
      if (error.response?.data) {
        console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }
}

// Setup: Create admin user and test restaurant
async function setupTestData() {
  try {
    console.log('\n🔧 Setting up test data...\n');
    
    // Create database connection pool
    pool = mysql.createPool(DB_CONFIG);

    // Register a new admin user
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      full_name: 'MenuAdmin',
      email: `menutestadmin${Date.now()}@test.com`,
      password: 'Admin123!@#',
      phone: '0901234567',
    });

    const userId = registerResponse.data.data.user.id;
    console.log(`✅ Admin user created with ID: ${userId}`);

    // Update user role to admin in database
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
    console.log('✅ User role updated to admin');

    // Login with admin credentials to get fresh token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerResponse.data.data.user.email,
      password: 'Admin123!@#',
    });

    adminToken = loginResponse.data.data.accessToken;
    console.log('✅ Admin token obtained');

    // Create a test restaurant for menu items
    const restaurantResponse = await axios.post(
      `${BASE_URL}/restaurants`,
      {
        name: 'Test Restaurant for Menu',
        description: 'Test restaurant for menu item testing',
        address: '123 Test Street',
        phone: '0901111111',
        is_open: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    testRestaurantId = restaurantResponse.data.data.restaurant.id;
    console.log(`✅ Test restaurant created with ID: ${testRestaurantId}\n`);
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Cleanup: Delete test data
async function cleanupTestData() {
  try {
    console.log('\n🧹 Cleaning up test data...\n');
    
    // Delete test restaurant (will cascade to menu items)
    if (testRestaurantId) {
      await axios.delete(`${BASE_URL}/restaurants/${testRestaurantId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log('✅ Test restaurant deleted');
    }

    // Close database connection
    if (pool) {
      await pool.end();
      console.log('✅ Database connection closed');
    }
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error.message);
  }
}

// Test 1: Get menu items (should be empty initially)
async function testGetMenuItemsEmpty() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?restaurantId=${testRestaurantId}`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length === 0;
    logTest('Get menu items (empty list)', passed);
  } catch (error) {
    logTest('Get menu items (empty list)', false, error);
  }
}

// Test 2: Create menu item without authentication (should fail)
async function testCreateMenuItemUnauthorized() {
  try {
    await axios.post(`${BASE_URL}/menu-items`, {
      restaurant_id: testRestaurantId,
      name: 'Test Item',
      price: 99.99,
    });
    logTest('Create menu item without auth (should fail)', false, 'Expected 401 error');
  } catch (error) {
    const passed = error.response?.status === 401;
    logTest('Create menu item without auth (should fail)', passed, passed ? null : error);
  }
}

// Test 3: Create menu item as admin
async function testCreateMenuItem() {
  try {
    const response = await axios.post(
      `${BASE_URL}/menu-items`,
      {
        restaurant_id: testRestaurantId,
        name: 'Delicious Burger',
        description: 'A juicy beef burger with cheese and vegetables',
        price: 129.99,
        discounted_price: 99.99,
        category: 'Burgers',
        is_available: true,
        is_featured: true,
        preparation_time: 15,
        calories: 650,
        ingredients: 'Beef patty, cheese, lettuce, tomato, onion, bun',
        allergens: 'Gluten, Dairy',
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const passed = response.status === 201 && response.data.data.id && response.data.data.slug;
    if (passed) {
      testMenuItemId = response.data.data.id;
    }
    logTest('Create menu item as admin', passed);
  } catch (error) {
    logTest('Create menu item as admin', false, error);
  }
}

// Test 4: Get menu item by ID
async function testGetMenuItemById() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items/${testMenuItemId}`);
    const passed = response.status === 200 && response.data.data.name === 'Delicious Burger';
    logTest('Get menu item by ID', passed);
  } catch (error) {
    logTest('Get menu item by ID', false, error);
  }
}

// Test 5: Get all menu items (should have at least 1)
async function testGetAllMenuItems() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length >= 1;
    logTest('Get all menu items', passed);
  } catch (error) {
    logTest('Get all menu items', false, error);
  }
}

// Test 6: Filter menu items by restaurant ID
async function testFilterByRestaurant() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?restaurantId=${testRestaurantId}`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length === 1;
    logTest('Filter menu items by restaurant', passed);
  } catch (error) {
    logTest('Filter menu items by restaurant', false, error);
  }
}

// Test 7: Search menu items by name
async function testSearchMenuItems() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?q=burger`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length > 0;
    logTest('Search menu items by name', passed);
  } catch (error) {
    logTest('Search menu items by name', false, error);
  }
}

// Test 8: Filter by category
async function testFilterByCategory() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?category=Burgers`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length > 0;
    logTest('Filter menu items by category', passed);
  } catch (error) {
    logTest('Filter menu items by category', false, error);
  }
}

// Test 9: Filter by availability
async function testFilterByAvailability() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?isAvailable=true`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length > 0;
    logTest('Filter by availability', passed);
  } catch (error) {
    logTest('Filter by availability', false, error);
  }
}

// Test 10: Filter by featured
async function testFilterByFeatured() {
  try {
    const response = await axios.get(`${BASE_URL}/menu-items?isFeatured=true`);
    const passed = response.status === 200 && Array.isArray(response.data.data.menuItems) && response.data.data.menuItems.length > 0;
    logTest('Filter by featured', passed);
  } catch (error) {
    logTest('Filter by featured', false, error);
  }
}

// Test 11: Update menu item as admin
async function testUpdateMenuItem() {
  try {
    const response = await axios.put(
      `${BASE_URL}/menu-items/${testMenuItemId}`,
      {
        name: 'Updated Burger',
        price: 139.99,
        is_featured: false,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    const passed = response.status === 200 && response.data.data.name === 'Updated Burger';
    logTest('Update menu item as admin', passed);
  } catch (error) {
    logTest('Update menu item as admin', false, error);
  }
}

// Test 12: Update menu item without authentication (should fail)
async function testUpdateMenuItemUnauthorized() {
  try {
    await axios.put(`${BASE_URL}/menu-items/${testMenuItemId}`, {
      name: 'Hacked Item',
    });
    logTest('Update menu item without auth (should fail)', false, 'Expected 401 error');
  } catch (error) {
    const passed = error.response?.status === 401;
    logTest('Update menu item without auth (should fail)', passed, passed ? null : error);
  }
}

// Test 13: Get non-existent menu item (should return 404)
async function testGetNonExistentMenuItem() {
  try {
    await axios.get(`${BASE_URL}/menu-items/999999`);
    logTest('Get non-existent menu item (should fail)', false, 'Expected 404 error');
  } catch (error) {
    const passed = error.response?.status === 404;
    logTest('Get non-existent menu item (should fail)', passed, passed ? null : error);
  }
}

// Test 14: Delete menu item without authentication (should fail)
async function testDeleteMenuItemUnauthorized() {
  try {
    await axios.delete(`${BASE_URL}/menu-items/${testMenuItemId}`);
    logTest('Delete menu item without auth (should fail)', false, 'Expected 401 error');
  } catch (error) {
    const passed = error.response?.status === 401;
    logTest('Delete menu item without auth (should fail)', passed, passed ? null : error);
  }
}

// Test 15: Delete menu item as admin
async function testDeleteMenuItem() {
  try {
    const response = await axios.delete(`${BASE_URL}/menu-items/${testMenuItemId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    const passed = response.status === 200;
    logTest('Delete menu item as admin', passed);
  } catch (error) {
    logTest('Delete menu item as admin', false, error);
  }
}

// Test 16: Verify menu item is deleted
async function testVerifyMenuItemDeleted() {
  try {
    await axios.get(`${BASE_URL}/menu-items/${testMenuItemId}`);
    logTest('Verify menu item deleted', false, 'Expected 404 error');
  } catch (error) {
    const passed = error.response?.status === 404;
    logTest('Verify menu item deleted', passed, passed ? null : error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Menu Item API Tests...\n');
  console.log('='.repeat(50));

  await setupTestData();

  console.log('='.repeat(50));
  console.log('\n🧪 Running Tests...\n');

  await testGetMenuItemsEmpty();
  await testCreateMenuItemUnauthorized();
  await testCreateMenuItem();
  await testGetMenuItemById();
  await testGetAllMenuItems();
  await testFilterByRestaurant();
  await testSearchMenuItems();
  await testFilterByCategory();
  await testFilterByAvailability();
  await testFilterByFeatured();
  await testUpdateMenuItem();
  await testUpdateMenuItemUnauthorized();
  await testGetNonExistentMenuItem();
  await testDeleteMenuItemUnauthorized();
  await testDeleteMenuItem();
  await testVerifyMenuItemDeleted();

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed\n`);
  console.log('='.repeat(50));

  await cleanupTestData();

  if (passedTests === totalTests) {
    console.log('\n✅ All tests passed! 🎉\n');
    process.exit(0);
  } else {
    console.log(`\n❌ ${totalTests - passedTests} test(s) failed.\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('💥 Test suite error:', error);
  process.exit(1);
});
