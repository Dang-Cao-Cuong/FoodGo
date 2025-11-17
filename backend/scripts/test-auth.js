const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/auth';
let accessToken = '';

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

// Test data
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'Test123456',
  full_name: 'Test User',
  phone: '0901234567'
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
      error: error.response?.data || error.message
    };
  }
}

// Test 1: Register new user
async function testRegister() {
  log.section('TEST 1: Register New User');
  log.info(`Email: ${testUser.email}`);

  const result = await makeRequest('POST', '/register', testUser);

  if (result.success && result.data.success) {
    log.success('User registered successfully');
    log.info(`User ID: ${result.data.data.user.id}`);
    log.info(`Full Name: ${result.data.data.user.full_name}`);
    accessToken = result.data.data.accessToken;
    log.info(`Token: ${accessToken.substring(0, 50)}...`);
    return true;
  } else {
    log.error('Registration failed');
    console.log(result.error);
    return false;
  }
}

// Test 2: Login
async function testLogin() {
  log.section('TEST 2: Login');
  
  const result = await makeRequest('POST', '/login', {
    email: testUser.email,
    password: testUser.password
  });

  if (result.success && result.data.success) {
    log.success('Login successful');
    log.info(`Role: ${result.data.data.user.role}`);
    accessToken = result.data.data.accessToken;
    log.info(`New Token: ${accessToken.substring(0, 50)}...`);
    return true;
  } else {
    log.error('Login failed');
    console.log(result.error);
    return false;
  }
}

// Test 3: Get Profile
async function testGetProfile() {
  log.section('TEST 3: Get Profile (Protected Route)');

  const result = await makeRequest('GET', '/profile', null, accessToken);

  if (result.success && result.data.success) {
    log.success('Profile retrieved successfully');
    const user = result.data.data.user;
    log.info(`Email: ${user.email}`);
    log.info(`Full Name: ${user.full_name}`);
    log.info(`Phone: ${user.phone}`);
    log.info(`Role: ${user.role}`);
    return true;
  } else {
    log.error('Failed to get profile');
    console.log(result.error);
    return false;
  }
}

// Test 4: Update Profile
async function testUpdateProfile() {
  log.section('TEST 4: Update Profile');

  const updates = {
    full_name: 'Updated Test User',
    phone: '0909876543'
  };

  const result = await makeRequest('PUT', '/profile', updates, accessToken);

  if (result.success && result.data.success) {
    log.success('Profile updated successfully');
    log.info(`New Full Name: ${result.data.data.user.full_name}`);
    log.info(`New Phone: ${result.data.data.user.phone}`);
    return true;
  } else {
    log.error('Failed to update profile');
    console.log(result.error);
    return false;
  }
}

// Test 5: Change Password
async function testChangePassword() {
  log.section('TEST 5: Change Password');

  const passwordData = {
    currentPassword: testUser.password,
    newPassword: 'NewTest123456'
  };

  const result = await makeRequest('POST', '/change-password', passwordData, accessToken);

  if (result.success && result.data.success) {
    log.success('Password changed successfully');
    testUser.password = passwordData.newPassword; // Update for future tests
    return true;
  } else {
    log.error('Failed to change password');
    console.log(result.error);
    return false;
  }
}

// Test 6: Login with new password
async function testLoginWithNewPassword() {
  log.section('TEST 6: Login with New Password');

  const result = await makeRequest('POST', '/login', {
    email: testUser.email,
    password: testUser.password
  });

  if (result.success && result.data.success) {
    log.success('Login with new password successful');
    return true;
  } else {
    log.error('Login with new password failed');
    console.log(result.error);
    return false;
  }
}

// Test 7: Logout
async function testLogout() {
  log.section('TEST 7: Logout');

  const result = await makeRequest('POST', '/logout', null, accessToken);

  if (result.success && result.data.success) {
    log.success('Logout successful');
    return true;
  } else {
    log.error('Logout failed');
    console.log(result.error);
    return false;
  }
}

// Test 8: Try to access protected route without token
async function testUnauthorizedAccess() {
  log.section('TEST 8: Unauthorized Access (Should Fail)');

  const result = await makeRequest('GET', '/profile');

  if (!result.success) {
    log.success('Correctly rejected unauthorized request');
    return true;
  } else {
    log.error('Security issue: Allowed access without token');
    return false;
  }
}

// Test 9: Invalid credentials
async function testInvalidLogin() {
  log.section('TEST 9: Invalid Credentials (Should Fail)');

  const result = await makeRequest('POST', '/login', {
    email: testUser.email,
    password: 'WrongPassword123'
  });

  if (!result.success) {
    log.success('Correctly rejected invalid credentials');
    return true;
  } else {
    log.error('Security issue: Accepted wrong password');
    return false;
  }
}

// Test 10: Duplicate email registration
async function testDuplicateEmail() {
  log.section('TEST 10: Duplicate Email (Should Fail)');

  const result = await makeRequest('POST', '/register', testUser);

  if (!result.success) {
    log.success('Correctly rejected duplicate email');
    return true;
  } else {
    log.error('Validation issue: Allowed duplicate email');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════╗
║         FoodGo Authentication API Tests          ║
║              Testing: ${BASE_URL}             ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

  let passed = 0;
  let failed = 0;

  const tests = [
    { name: 'Register', fn: testRegister },
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Change Password', fn: testChangePassword },
    { name: 'Login with New Password', fn: testLoginWithNewPassword },
    { name: 'Logout', fn: testLogout },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Invalid Login', fn: testInvalidLogin },
    { name: 'Duplicate Email', fn: testDuplicateEmail }
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
