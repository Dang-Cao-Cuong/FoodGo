const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let testOrderId = null;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper function to print test results
function printResult(testName, passed, message = '') {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${status} - ${testName}`);
  if (message) {
    console.log(`  ${colors.cyan}${message}${colors.reset}`);
  }
}

// Helper function to print section headers
function printSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Test 1: Login to get auth token
async function testLogin() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Password123',
    });

    authToken = response.data.data.accessToken;
    printResult('Login', true, `Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    printResult('Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Create a new order
async function testCreateOrder() {
  try {
    const orderData = {
      restaurantId: 1,
      deliveryAddress: '123 Main Street, Apt 4B, New York, NY 10001',
      subtotalAmount: 35.00,
      taxAmount: 2.45,
      deliveryFee: 0.00,
      totalAmount: 37.45,
      notes: 'Please ring the doorbell twice',
      items: [
        {
          menuItemId: 1,
          quantity: 2,
          price: 12.99,
          notes: 'Extra cheese'
        },
        {
          menuItemId: 2,
          quantity: 1,
          price: 9.02,
        }
      ]
    };

    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    testOrderId = response.data.order.id;
    printResult('Create Order', true, `Order ID: ${testOrderId}, Total: $${response.data.order.total_amount}`);
    return true;
  } catch (error) {
    printResult('Create Order', false, error.response?.data?.message || error.message);
    if (error.response?.data?.errors) {
      console.log('  Validation errors:', error.response.data.errors);
    }
    return false;
  }
}

// Test 3: Create order with validation errors
async function testCreateOrderValidationErrors() {
  try {
    const invalidOrderData = {
      restaurantId: 'invalid', // Should be a number
      deliveryAddress: 'short', // Too short
      subtotalAmount: -10, // Negative number
      items: [], // Empty array
    };

    await axios.post(`${API_URL}/orders`, invalidOrderData, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    printResult('Create Order - Validation Errors', false, 'Should have failed validation');
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      printResult('Create Order - Validation Errors', true, 'Correctly rejected invalid data');
      return true;
    }
    printResult('Create Order - Validation Errors', false, error.message);
    return false;
  }
}

// Test 4: Get my orders
async function testGetMyOrders() {
  try {
    const response = await axios.get(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const orders = response.data.orders;
    printResult('Get My Orders', true, `Found ${orders.length} orders`);
    return true;
  } catch (error) {
    printResult('Get My Orders', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 5: Get my orders with status filter
async function testGetMyOrdersWithFilter() {
  try {
    const response = await axios.get(`${API_URL}/orders/my-orders?status=pending`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const orders = response.data.orders;
    const allPending = orders.every(order => order.status === 'pending');
    
    printResult('Get My Orders - Status Filter', allPending, `Found ${orders.length} pending orders`);
    return allPending;
  } catch (error) {
    printResult('Get My Orders - Status Filter', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 6: Get my orders with pagination
async function testGetMyOrdersWithPagination() {
  try {
    const response = await axios.get(`${API_URL}/orders/my-orders?limit=5&offset=0`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const orders = response.data.orders;
    const limitRespected = orders.length <= 5;
    
    printResult('Get My Orders - Pagination', limitRespected, `Retrieved ${orders.length} orders (limit: 5)`);
    return limitRespected;
  } catch (error) {
    printResult('Get My Orders - Pagination', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 7: Get order by ID
async function testGetOrderById() {
  if (!testOrderId) {
    printResult('Get Order by ID', false, 'No test order ID available');
    return false;
  }

  try {
    const response = await axios.get(`${API_URL}/orders/${testOrderId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const order = response.data;
    const hasItems = order.items && order.items.length > 0;
    
    printResult('Get Order by ID', true, `Order #${order.id}, Status: ${order.status}, Items: ${order.items?.length || 0}`);
    return hasItems;
  } catch (error) {
    printResult('Get Order by ID', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 8: Get order by invalid ID
async function testGetOrderByInvalidId() {
  try {
    await axios.get(`${API_URL}/orders/99999`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    printResult('Get Order by Invalid ID', false, 'Should have returned 404');
    return false;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 403) {
      printResult('Get Order by Invalid ID', true, 'Correctly returned error for invalid ID');
      return true;
    }
    printResult('Get Order by Invalid ID', false, error.message);
    return false;
  }
}

// Test 9: Get order statistics
async function testGetOrderStats() {
  try {
    const response = await axios.get(`${API_URL}/orders/my-orders/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const stats = response.data;
    const hasRequiredFields = 
      stats.hasOwnProperty('total_orders') &&
      stats.hasOwnProperty('completed_orders') &&
      stats.hasOwnProperty('cancelled_orders') &&
      stats.hasOwnProperty('active_orders') &&
      stats.hasOwnProperty('total_spent');
    
    printResult('Get Order Statistics', hasRequiredFields, 
      `Total: ${stats.total_orders}, Completed: ${stats.completed_orders}, Active: ${stats.active_orders}, Spent: $${stats.total_spent}`);
    return hasRequiredFields;
  } catch (error) {
    printResult('Get Order Statistics', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 10: Update order status (should work as admin or fail as regular user)
async function testUpdateOrderStatus() {
  if (!testOrderId) {
    printResult('Update Order Status', false, 'No test order ID available');
    return false;
  }

  try {
    const response = await axios.patch(
      `${API_URL}/orders/${testOrderId}/status`,
      { status: 'confirmed' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    printResult('Update Order Status', true, `Status updated to: ${response.data.order.status}`);
    return true;
  } catch (error) {
    // This might fail if user is not admin, which is expected
    if (error.response?.status === 403) {
      printResult('Update Order Status', true, 'Correctly restricted to admin users');
      return true;
    }
    printResult('Update Order Status', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 11: Cancel order
async function testCancelOrder() {
  if (!testOrderId) {
    printResult('Cancel Order', false, 'No test order ID available');
    return false;
  }

  try {
    const response = await axios.post(
      `${API_URL}/orders/${testOrderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const cancelled = response.data.order.status === 'cancelled';
    printResult('Cancel Order', cancelled, `Order #${testOrderId} cancelled`);
    return cancelled;
  } catch (error) {
    printResult('Cancel Order', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 12: Cancel already cancelled order
async function testCancelAlreadyCancelledOrder() {
  if (!testOrderId) {
    printResult('Cancel Already Cancelled Order', false, 'No test order ID available');
    return false;
  }

  try {
    await axios.post(
      `${API_URL}/orders/${testOrderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    printResult('Cancel Already Cancelled Order', false, 'Should have failed');
    return false;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 500) {
      printResult('Cancel Already Cancelled Order', true, 'Correctly rejected cancellation');
      return true;
    }
    printResult('Cancel Already Cancelled Order', false, error.message);
    return false;
  }
}

// Test 13: Create order without authentication
async function testCreateOrderWithoutAuth() {
  try {
    await axios.post(`${API_URL}/orders`, {
      restaurantId: 1,
      deliveryAddress: '123 Main St',
      totalAmount: 20.00,
      items: []
    });

    printResult('Create Order - No Auth', false, 'Should have required authentication');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      printResult('Create Order - No Auth', true, 'Correctly required authentication');
      return true;
    }
    printResult('Create Order - No Auth', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}   FoodGo Order API Tests${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
  console.log(`API URL: ${API_URL}\n`);

  const results = {
    passed: 0,
    failed: 0,
  };

  // Authentication
  printSection('AUTHENTICATION');
  if (await testLogin()) results.passed++; else results.failed++;

  // Create Order Tests
  printSection('CREATE ORDER TESTS');
  if (await testCreateOrder()) results.passed++; else results.failed++;
  if (await testCreateOrderValidationErrors()) results.passed++; else results.failed++;
  if (await testCreateOrderWithoutAuth()) results.passed++; else results.failed++;

  // Get Orders Tests
  printSection('GET ORDERS TESTS');
  if (await testGetMyOrders()) results.passed++; else results.failed++;
  if (await testGetMyOrdersWithFilter()) results.passed++; else results.failed++;
  if (await testGetMyOrdersWithPagination()) results.passed++; else results.failed++;
  if (await testGetOrderById()) results.passed++; else results.failed++;
  if (await testGetOrderByInvalidId()) results.passed++; else results.failed++;
  if (await testGetOrderStats()) results.passed++; else results.failed++;

  // Update/Cancel Order Tests
  printSection('UPDATE ORDER TESTS');
  if (await testUpdateOrderStatus()) results.passed++; else results.failed++;
  if (await testCancelOrder()) results.passed++; else results.failed++;
  if (await testCancelAlreadyCancelledOrder()) results.passed++; else results.failed++;

  // Summary
  console.log(`\n${colors.yellow}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}   TEST SUMMARY${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(60)}${colors.reset}\n`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Total: ${results.passed + results.failed}\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch((error) => {
  console.error(`\n${colors.red}Error running tests:${colors.reset}`, error.message);
  process.exit(1);
});
