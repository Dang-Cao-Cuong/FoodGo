const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let adminToken = '';
let testRestaurantId = null;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}${colors.reset}`)
};

// Helper function to make requests
async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Setup: Create admin user and get token
async function setupAdminUser() {
  log.section('SETUP: Create Admin User');
  
  const adminEmail = `admin${Date.now()}@foodgo.com`;
  const adminPassword = 'Admin123456';

  // Register admin user
  const registerResult = await makeRequest('POST', '/auth/register', {
    email: adminEmail,
    password: adminPassword,
    full_name: 'Admin User',
    phone: '0901234567'
  });

  if (!registerResult.success) {
    log.error('Failed to register admin user');
    return false;
  }

  const userId = registerResult.data.data.user.id;
  
  // Update user role to admin in database using the database config
  const { pool } = require('../src/config/database');
  
  try {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['admin', userId]);
    log.success('Admin user role updated to admin');
    log.info(`User ID: ${userId}`);
  } catch (error) {
    log.error('Failed to update user role to admin');
    console.log(error);
    return false;
  }

  // Login again to get a new token with admin role
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: adminEmail,
    password: adminPassword
  });

  if (!loginResult.success) {
    log.error('Failed to login as admin after role update');
    return false;
  }

  adminToken = loginResult.data.data.accessToken;
  log.success('Admin user logged in with admin privileges');
  log.info(`Token: ${adminToken.substring(0, 50)}...`);
  
  return true;
}

// Test 1: Get all restaurants (empty list)
async function testGetRestaurantsEmpty() {
  log.section('TEST 1: Get Restaurants (Empty List)');

  const result = await makeRequest('GET', '/restaurants');

  if (result.success && result.data.success) {
    log.success('Retrieved restaurants successfully');
    log.info(`Count: ${result.data.data.count}`);
    return true;
  } else {
    log.error('Failed to get restaurants');
    console.log(result.error);
    return false;
  }
}

// Test 2: Create restaurant (without admin token - should fail)
async function testCreateRestaurantUnauthorized() {
  log.section('TEST 2: Create Restaurant Without Auth (Should Fail)');

  const result = await makeRequest('POST', '/restaurants', {
    name: 'Test Restaurant',
    address: '123 Test St',
    phone: '0901234567'
  });

  if (!result.success && result.status === 401) {
    log.success('Correctly rejected unauthorized request');
    return true;
  } else {
    log.error('Security issue: Allowed creation without auth');
    return false;
  }
}

// Test 3: Create restaurant with admin token
async function testCreateRestaurant() {
  log.section('TEST 3: Create Restaurant (Admin)');

  const restaurantData = {
    name: 'Pizza Palace',
    description: 'Best pizza in town',
    address: '123 Main Street, District 1, Ho Chi Minh City',
    phone: '0281234567',
    cover_url: 'https://example.com/pizza.jpg',
    is_open: true
  };

  const result = await makeRequest('POST', '/restaurants', restaurantData, adminToken);

  if (result.success && result.data.success) {
    log.success('Restaurant created successfully');
    testRestaurantId = result.data.data.restaurant.id;
    log.info(`Restaurant ID: ${testRestaurantId}`);
    log.info(`Name: ${result.data.data.restaurant.name}`);
    return true;
  } else {
    log.error('Failed to create restaurant');
    console.log(result.error);
    return false;
  }
}

// Test 4: Get restaurant by ID
async function testGetRestaurantById() {
  log.section('TEST 4: Get Restaurant by ID');

  const result = await makeRequest('GET', `/restaurants/${testRestaurantId}`);

  if (result.success && result.data.success) {
    log.success('Retrieved restaurant successfully');
    log.info(`Name: ${result.data.data.restaurant.name}`);
    log.info(`Address: ${result.data.data.restaurant.address}`);
    return true;
  } else {
    log.error('Failed to get restaurant');
    console.log(result.error);
    return false;
  }
}

// Test 5: Get all restaurants (should have 1)
async function testGetRestaurants() {
  log.section('TEST 5: Get All Restaurants');

  const result = await makeRequest('GET', '/restaurants');

  if (result.success && result.data.success && result.data.data.count > 0) {
    log.success('Retrieved restaurants successfully');
    log.info(`Count: ${result.data.data.count}`);
    return true;
  } else {
    log.error('Failed to get restaurants or count is 0');
    console.log(result.error);
    return false;
  }
}

// Test 6: Search restaurants
async function testSearchRestaurants() {
  log.section('TEST 6: Search Restaurants');

  const result = await makeRequest('GET', '/restaurants?q=Pizza');

  if (result.success && result.data.success) {
    log.success('Search completed successfully');
    log.info(`Results: ${result.data.data.count}`);
    return true;
  } else {
    log.error('Search failed');
    console.log(result.error);
    return false;
  }
}

// Test 7: Update restaurant
async function testUpdateRestaurant() {
  log.section('TEST 7: Update Restaurant (Admin)');

  const updateData = {
    name: 'Pizza Palace - Updated',
    description: 'The best pizza in the entire city!',
    is_open: false
  };

  const result = await makeRequest('PUT', `/restaurants/${testRestaurantId}`, updateData, adminToken);

  if (result.success && result.data.success) {
    log.success('Restaurant updated successfully');
    log.info(`New Name: ${result.data.data.restaurant.name}`);
    log.info(`Is Open: ${result.data.data.restaurant.is_open}`);
    return true;
  } else {
    log.error('Failed to update restaurant');
    console.log(result.error);
    return false;
  }
}

// Test 8: Update restaurant without auth (should fail)
async function testUpdateRestaurantUnauthorized() {
  log.section('TEST 8: Update Restaurant Without Auth (Should Fail)');

  const result = await makeRequest('PUT', `/restaurants/${testRestaurantId}`, {
    name: 'Hacked Name'
  });

  if (!result.success && result.status === 401) {
    log.success('Correctly rejected unauthorized update');
    return true;
  } else {
    log.error('Security issue: Allowed update without auth');
    return false;
  }
}

// Test 9: Get non-existent restaurant
async function testGetNonExistentRestaurant() {
  log.section('TEST 9: Get Non-existent Restaurant (Should Fail)');

  const result = await makeRequest('GET', '/restaurants/999999');

  if (!result.success && result.status === 404) {
    log.success('Correctly returned 404 for non-existent restaurant');
    return true;
  } else {
    log.error('Failed to handle non-existent restaurant correctly');
    return false;
  }
}

// Test 10: Delete restaurant without auth (should fail)
async function testDeleteRestaurantUnauthorized() {
  log.section('TEST 10: Delete Restaurant Without Auth (Should Fail)');

  const result = await makeRequest('DELETE', `/restaurants/${testRestaurantId}`);

  if (!result.success && result.status === 401) {
    log.success('Correctly rejected unauthorized delete');
    return true;
  } else {
    log.error('Security issue: Allowed delete without auth');
    return false;
  }
}

// Test 11: Delete restaurant with admin token
async function testDeleteRestaurant() {
  log.section('TEST 11: Delete Restaurant (Admin)');

  const result = await makeRequest('DELETE', `/restaurants/${testRestaurantId}`, null, adminToken);

  if (result.success && result.data.success) {
    log.success('Restaurant deleted successfully');
    return true;
  } else {
    log.error('Failed to delete restaurant');
    console.log(result.error);
    return false;
  }
}

// Test 12: Verify restaurant is deleted
async function testVerifyDeleted() {
  log.section('TEST 12: Verify Restaurant Deleted');

  const result = await makeRequest('GET', `/restaurants/${testRestaurantId}`);

  if (!result.success && result.status === 404) {
    log.success('Restaurant successfully deleted and not found');
    return true;
  } else {
    log.error('Restaurant still exists after deletion');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════╗
║       FoodGo Restaurant API Tests                ║
║              Testing: ${BASE_URL}             ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  let passed = 0;
  let failed = 0;

  // Setup
  const setupSuccess = await setupAdminUser();
  if (!setupSuccess) {
    log.error('Setup failed. Cannot continue tests.');
    process.exit(1);
  }

  const tests = [
    { name: 'Get Restaurants (Empty)', fn: testGetRestaurantsEmpty },
    { name: 'Create Restaurant Unauthorized', fn: testCreateRestaurantUnauthorized },
    { name: 'Create Restaurant', fn: testCreateRestaurant },
    { name: 'Get Restaurant by ID', fn: testGetRestaurantById },
    { name: 'Get All Restaurants', fn: testGetRestaurants },
    { name: 'Search Restaurants', fn: testSearchRestaurants },
    { name: 'Update Restaurant', fn: testUpdateRestaurant },
    { name: 'Update Restaurant Unauthorized', fn: testUpdateRestaurantUnauthorized },
    { name: 'Get Non-existent Restaurant', fn: testGetNonExistentRestaurant },
    { name: 'Delete Restaurant Unauthorized', fn: testDeleteRestaurantUnauthorized },
    { name: 'Delete Restaurant', fn: testDeleteRestaurant },
    { name: 'Verify Deleted', fn: testVerifyDeleted },
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log.error(`Unexpected error in ${test.name}: ${error.message}`);
      failed++;
    }
  }

  // Summary
  console.log(`\n${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.cyan}SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(50)}${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${failed}${colors.reset}`);
  console.log(`Total Tests: ${passed + failed}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please check the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get('http://localhost:3000/api/health');
    log.success('Server is running');
    return true;
  } catch (error) {
    log.error('Server is not running. Please start the server first.');
    log.info('Run: npm run dev');
    return false;
  }
}

// Main execution
(async () => {
  const isServerRunning = await checkServer();
  if (isServerRunning) {
    await runAllTests();
  }
})();
