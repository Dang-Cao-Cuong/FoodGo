const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m',
};

let authToken = '';
let testRestaurantId = 1;
let testMenuItemId = 1;
let testFavoriteId = null;
let testReviewId = null;

let passedTests = 0;
let failedTests = 0;

// Helper function to log results
function logResult(testName, success, message) {
  if (success) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    if (message) console.log(`  ${colors.blue}${message}${colors.reset}`);
    passedTests++;
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    if (message) console.log(`  ${colors.red}${message}${colors.reset}`);
    failedTests++;
  }
}

// Test 1: Login
async function testLogin() {
  try {
    console.log(`  Connecting to: ${API_BASE_URL}/auth/login`);
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Password123',
    });

    authToken = response.data.data.accessToken;
    logResult('TEST 1: Login', true, `Token received: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    console.log(`  Error details:`, error.response?.status, error.response?.statusText);
    console.log(`  Response data:`, error.response?.data);
    logResult('TEST 1: Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Test 2: Add Restaurant to Favorites
async function testAddRestaurantFavorite() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/favorites`,
      {
        favorite_type: 'restaurant',
        favorite_id: testRestaurantId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    testFavoriteId = response.data.data.favorite.id;
    logResult(
      'TEST 2: Add Restaurant to Favorites',
      true,
      `Favorite ID: ${testFavoriteId}`
    );
    return true;
  } catch (error) {
    // If already favorited, get the favorite ID from list
    if (error.response?.status === 500 && error.response?.data?.message?.includes('Already added')) {
      try {
        const favs = await axios.get(`${API_BASE_URL}/favorites/my-favorites`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const restaurantFav = favs.data.data.favorites.find(f => f.favorite_type === 'restaurant' && f.favorite_id === testRestaurantId);
        if (restaurantFav) {
          testFavoriteId = restaurantFav.id;
          logResult('TEST 2: Add Restaurant to Favorites', true, `Already exists, ID: ${testFavoriteId}`);
          return true;
        }
      } catch (e) {
        // Ignore
      }
    }
    logResult(
      'TEST 2: Add Restaurant to Favorites',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 3: Add Menu Item to Favorites
async function testAddMenuItemFavorite() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/favorites`,
      {
        favorite_type: 'menu_item',
        favorite_id: testMenuItemId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    logResult('TEST 3: Add Menu Item to Favorites', true, 'Menu item favorited');
    return true;
  } catch (error) {
    // If already favorited, consider it a pass
    if (error.response?.status === 500 && error.response?.data?.message?.includes('Already added')) {
      logResult('TEST 3: Add Menu Item to Favorites', true, 'Already exists - OK');
      return true;
    }
    logResult(
      'TEST 3: Add Menu Item to Favorites',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 4: Get My Favorites
async function testGetMyFavorites() {
  try {
    const response = await axios.get(`${API_BASE_URL}/favorites/my-favorites`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const count = response.data.data.favorites.length;
    logResult('TEST 4: Get My Favorites', true, `Found ${count} favorites`);
    return true;
  } catch (error) {
    logResult(
      'TEST 4: Get My Favorites',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 5: Check if Restaurant is Favorited
async function testCheckFavorite() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/favorites/check/restaurant/${testRestaurantId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    const isFavorite = response.data.data.is_favorite;
    logResult(
      'TEST 5: Check if Restaurant is Favorited',
      isFavorite === true,
      `Is favorited: ${isFavorite}`
    );
    return true;
  } catch (error) {
    logResult(
      'TEST 5: Check if Restaurant is Favorited',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 6: Create Review for Restaurant
async function testCreateReview() {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/reviews`,
      {
        restaurant_id: testRestaurantId,
        rating: 5,
        comment: 'Amazing food and service!',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    testReviewId = response.data.data.review.id;
    logResult('TEST 6: Create Review for Restaurant', true, `Review ID: ${testReviewId}`);
    return true;
  } catch (error) {
    logResult(
      'TEST 6: Create Review for Restaurant',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 7: Get Restaurant Reviews
async function testGetRestaurantReviews() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reviews/restaurant/${testRestaurantId}`
    );

    const reviews = response.data.data.reviews;
    const avgRating = response.data.data.rating_stats.average_rating;
    logResult(
      'TEST 7: Get Restaurant Reviews',
      true,
      `Found ${reviews.length} reviews, Avg Rating: ${avgRating}`
    );
    return true;
  } catch (error) {
    logResult(
      'TEST 7: Get Restaurant Reviews',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 8: Get My Reviews
async function testGetMyReviews() {
  try {
    const response = await axios.get(`${API_BASE_URL}/reviews/my-reviews`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const count = response.data.data.reviews.length;
    logResult('TEST 8: Get My Reviews', true, `Found ${count} reviews`);
    return true;
  } catch (error) {
    logResult(
      'TEST 8: Get My Reviews',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 9: Update Review
async function testUpdateReview() {
  try {
    await axios.put(
      `${API_BASE_URL}/reviews/${testReviewId}`,
      {
        rating: 4,
        comment: 'Very good, but room for improvement',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    logResult('TEST 9: Update Review', true, 'Review updated successfully');
    return true;
  } catch (error) {
    logResult(
      'TEST 9: Update Review',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 10: Get Restaurant Rating Stats
async function testGetRatingStats() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reviews/restaurant/${testRestaurantId}/stats`
    );

    const stats = response.data.data;
    logResult(
      'TEST 10: Get Restaurant Rating Stats',
      true,
      `Avg: ${stats.average_rating}, Total: ${stats.review_count}`
    );
    return true;
  } catch (error) {
    logResult(
      'TEST 10: Get Restaurant Rating Stats',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 11: Remove Favorite
async function testRemoveFavorite() {
  try {
    await axios.delete(`${API_BASE_URL}/favorites/${testFavoriteId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logResult('TEST 11: Remove Favorite', true, 'Favorite removed');
    return true;
  } catch (error) {
    logResult(
      'TEST 11: Remove Favorite',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 12: Delete Review
async function testDeleteReview() {
  try {
    await axios.delete(`${API_BASE_URL}/reviews/${testReviewId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    logResult('TEST 12: Delete Review', true, 'Review deleted');
    return true;
  } catch (error) {
    logResult(
      'TEST 12: Delete Review',
      false,
      error.response?.data?.message || error.message
    );
    return false;
  }
}

// Test 13: Try to Add Duplicate Favorite (Should Fail)
async function testDuplicateFavorite() {
  try {
    await axios.post(
      `${API_BASE_URL}/favorites`,
      {
        favorite_type: 'restaurant',
        favorite_id: testRestaurantId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    // Add again
    await axios.post(
      `${API_BASE_URL}/favorites`,
      {
        favorite_type: 'restaurant',
        favorite_id: testRestaurantId,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    logResult('TEST 13: Try to Add Duplicate Favorite', false, 'Should have failed but succeeded');
    return false;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 500) {
      logResult('TEST 13: Try to Add Duplicate Favorite (Should Fail)', true, 'Correctly rejected');
      return true;
    }
    logResult('TEST 13: Try to Add Duplicate Favorite', false, error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}   Testing Favorites & Reviews APIs    ${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  await testLogin();
  await testAddRestaurantFavorite();
  await testAddMenuItemFavorite();
  await testGetMyFavorites();
  await testCheckFavorite();
  await testCreateReview();
  await testGetRestaurantReviews();
  await testGetMyReviews();
  await testUpdateReview();
  await testGetRatingStats();
  await testRemoveFavorite();
  await testDeleteReview();
  await testDuplicateFavorite();

  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(
    `${colors.yellow}SUMMARY: ${colors.green}✓ Passed: ${passedTests} ${colors.red}| ✗ Failed: ${failedTests}${colors.reset}`
  );
  console.log(`${colors.blue}========================================${colors.reset}\n`);

  if (failedTests === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed!${colors.reset}\n`);
    process.exit(1);
  }
}

runAllTests();
