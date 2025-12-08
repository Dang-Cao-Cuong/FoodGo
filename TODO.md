# 📋 FoodGo - TODO List

**Last Updated:** November 29, 2025  
**Current Phase:** Week 7-8 Frontend - COMPLETE ✅ | Moving to Week 9-10

---

## 🔥 IMMEDIATE PRIORITIES (Week 9-10: Notifications & Real-time)

### Backend Favorites & Reviews ✅ COMPLETE

### Frontend Favorites & Reviews ✅ COMPLETE
- [x] **Favorite Service** ✅
  - [x] Create `frontend/src/services/favoriteService.ts` ✅
  - [x] addFavorite method ✅
  - [x] removeFavorite method ✅
  - [x] getMyFavorites method ✅
  - [x] checkFavoriteStatus method ✅
  - [x] toggleFavorite helper method ✅
  - [x] Error handling ✅
  
- [x] **Review Service** ✅
  - [x] Create `frontend/src/services/reviewService.ts` ✅
  - [x] createReview method ✅
  - [x] getRestaurantReviews method ✅
  - [x] getMenuItemReviews method ✅
  - [x] updateReview method ✅
  - [x] deleteReview method ✅
  - [x] getRatingStats method ✅
  - [x] Error handling ✅
  
- [x] **Components** ✅
  - [x] FavoriteButton component (heart icon toggle) ✅
  - [x] ReviewCard component (display review with rating) ✅
  - [x] ReviewForm component (submit/edit review) ✅
  - [x] RatingStars component (star display) ✅
  - [x] RatingDistribution component (stats visualization) ✅
  
- [x] **Favorites Screen** ✅
  - [x] `frontend/src/screens/favorites/FavoritesScreen.tsx` ✅
  - [x] Tabbed view (Restaurants / Menu Items) ✅
  - [x] Favorite list with cards ✅
  - [x] Remove favorite functionality ✅
  - [x] Pull-to-refresh ✅
  - [x] Empty state ✅
  - [x] Navigation to details ✅
  - [x] Added to MainNavigator with heart icon ✅
  
- [x] **Reviews Integration** ✅
  - [x] Add review section to RestaurantDetailScreen ✅
  - [x] Add favorite button to RestaurantCard ✅
  - [x] Add favorite button to RestaurantDetailScreen ✅
  - [x] Add favorite button to MenuItemCard ✅
  - [x] Display average rating on restaurant cards ✅
  - [x] Display rating distribution ✅
  - [x] Review submission modal/screen ✅
  - [x] Edit review functionality ✅

---

## 🎯 NEXT PHASE (Week 9-10): Notifications & Real-time Tracking

### Backend Real-time Features
- [ ] **WebSocket/Socket.IO Setup**
  - [ ] Install socket.io
  - [ ] Configure Socket.IO server
  - [ ] Authentication middleware for sockets
  - [ ] Room management (user rooms, order rooms)
  
- [ ] **Order Status Events**
  - [ ] Emit events on order status changes
  - [ ] Real-time order updates
  - [ ] Delivery tracking events
  - [ ] Order assignment to delivery driver
  
- [ ] **Notification System**
  - [ ] Notification model (database)
  - [ ] Create notification on order events
  - [ ] Mark notification as read
  - [ ] Get user notifications
  - [ ] Delete notifications

### Frontend Real-time Features  
- [ ] **Socket.IO Integration**
  - [ ] Install @socket.io/client
  - [ ] Create socket service
  - [ ] Connect/disconnect logic
  - [ ] Authentication with socket
  
- [ ] **Real-time Order Tracking**
  - [ ] Listen to order status updates
  - [ ] Update UI on status changes
  - [ ] Show real-time progress
  - [ ] Delivery driver location (if available)
  
- [ ] **Push Notifications**
  - [ ] Install react-native-push-notification
  - [ ] Configure Android/iOS permissions
  - [ ] Handle notification display
  - [ ] Navigate on notification tap
  - [ ] Notification badge management
  
- [ ] **Notifications Screen**
  - [ ] List all notifications
  - [ ] Mark as read functionality
  - [ ] Delete notifications
  - [ ] Pull-to-refresh
  - [ ] Empty state
  - [ ] Navigate to related order/restaurant

---

## 🔥 BACKLOG PRIORITIES (Week 5-6: Cart & Orders)

### Backend Cart & Order APIs ✅ COMPLETE
- [x] **Restaurant Model & Endpoints** ✅
  - [x] Create `backend/src/models/Restaurant.js` ✅
  - [x] GET `/api/restaurants` - List all restaurants ✅
  - [x] GET `/api/restaurants/:id` - Get restaurant details ✅
  - [x] POST `/api/restaurants` - Create restaurant (admin) ✅
  - [x] PUT `/api/restaurants/:id` - Update restaurant (admin) ✅
  - [x] DELETE `/api/restaurants/:id` - Delete restaurant (admin) ✅
  - [x] Add search & filter logic ✅
  - [x] Validators for all endpoints ✅
  - [x] Test script (backend/scripts/test-restaurants.js) ✅
  
- [x] **Menu Item Endpoints** ✅
  - [x] GET `/api/menu-items` - Get all menu items with filters ✅
  - [x] GET `/api/menu-items/:id` - Get menu item details ✅
  - [x] POST `/api/menu-items` - Create menu item (admin) ✅
  - [x] PUT `/api/menu-items/:id` - Update menu item (admin) ✅
  - [x] DELETE `/api/menu-items/:id` - Delete menu item (admin) ✅
### Frontend Cart & Orders - ✅ COMPLETE
- [x] **Cart Context & State Management** ✅
- [x] **Order Service** ✅
- [x] **CartScreen with item management** ✅
- [x] **CheckoutScreen with address input** ✅
- [x] **OrdersScreen with status tracking** ✅
- [x] **OrderDetailScreen** ✅

---

## 🎯 NEXT PHASE (Week 7-8): Favorites & Reviews Frontend

### Frontend Tasks
- [ ] Favorite service implementation
- [ ] Review service implementation
- [ ] FavoriteButton component
- [ ] ReviewCard and ReviewForm components
- [ ] RatingStars component
- [ ] FavoritesScreen
- [ ] Integrate favorites into existing screens
- [ ] Integrate reviews into RestaurantDetailScreen
- [ ] Rating submission flow

---

## 📝 BACKLOG (Future Features)

### Phase 6: Advanced Features (Week 9-10)
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Order status updates
- [ ] Delivery tracking map
- [ ] Chat with delivery driver

### Phase 7: Payment Integration (Week 11-12)
- [ ] Payment gateway integration
- [ ] Multiple payment methods
- [ ] Payment history
- [ ] Refund handling
- [ ] Invoice generation

### Phase 8: Offline-First (Week 13-14)
- [ ] SQLite schema
- [ ] Sync service
- [ ] Offline queue
- [ ] Conflict resolution
- [ ] Background sync

### Phase 8: Polish & Testing (Week 15-16)
- [ ] UI/UX refinement
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Bug fixes

---

## 🐛 KNOWN ISSUES
- None (All Week 3 backend tests passing!)

---

## 💡 IDEAS & IMPROVEMENTS
- [ ] Push notifications for order updates
- [ ] Dark mode support
- [ ] Multiple language support (i18n)
- [ ] Order re-ordering feature
- [ ] Social sharing
- [ ] Customer support chat
- [ ] Biometric authentication (Face ID / Touch ID)
- [ ] Social login (Google, Facebook)

---

## 📚 DOCUMENTATION

### Completed ✅
- [x] docs/API.md - Authentication endpoints
- [x] docs/DATABASE_SCHEMA.md - Complete database design
- [x] PROJECT_PLAN.md - 16-week roadmap
- [x] FOLDER_STRUCTURE.md - Project architecture
- [x] README.md - Project overview
- [x] WEEK2_COMPLETE.md - Database completion summary
- [x] WEEK3_BACKEND_COMPLETE.md - Auth backend summary

### To Create
- [ ] docs/DEPLOYMENT.md - Deployment guide
- [ ] docs/TESTING.md - Testing strategy
- [ ] docs/OFFLINE_SYNC.md - Offline sync architecture
- [ ] docs/FRONTEND_SETUP.md - React Native setup guide

---

## ✅ COMPLETED TASKS

### November 29, 2025 - Week 7-8: Favorites & Reviews Frontend ✅ COMPLETE
- [x] Favorite Service (frontend/src/services/favoriteService.ts - 244 lines)
  - [x] addFavorite, removeFavorite, toggleFavorite methods
  - [x] getMyFavorites, getRestaurantFavorites, getMenuItemFavorites
  - [x] checkFavoriteStatus with caching support
  - [x] Complete error handling
- [x] Review Service (frontend/src/services/reviewService.ts - 217 lines)
  - [x] createReview, updateReview, deleteReview methods
  - [x] getRestaurantReviews, getMenuItemReviews, getMyReviews
  - [x] getRestaurantRatingStats with distribution
  - [x] Pagination support
- [x] Components
  - [x] FavoriteButton (heart icon with animated toggle)
  - [x] ReviewCard (user review display with rating stars)
  - [x] ReviewForm (modal form for submit/edit review)
  - [x] RatingStars (star display component)
  - [x] RatingDistribution (visual stats with bars)
- [x] FavoritesScreen (frontend/src/screens/favorites/FavoritesScreen.tsx)
  - [x] Tabbed view for Restaurants and Menu Items
  - [x] Grid layout with favorite cards
  - [x] Remove favorite with confirmation
  - [x] Pull-to-refresh
  - [x] Empty states
  - [x] Navigation integration
- [x] Integration & Navigation
  - [x] Added FavoriteButton to RestaurantCard
  - [x] Added FavoriteButton to RestaurantDetailScreen  
  - [x] Added FavoriteButton to MenuItemCard
  - [x] Added review section to RestaurantDetailScreen
  - [x] Added rating display to restaurant cards
  - [x] Added Favorites tab to MainNavigator
  - [x] Updated navigation types

### November 16, 2025 - Week 7-8: Favorites & Reviews Backend ✅ COMPLETE
- [x] Favorite Model (backend/src/models/Favorite.js - 230 lines)
  - [x] addFavorite(userId, favoriteType, favoriteId) - Add with duplicate check
  - [x] removeFavorite(userId, favoriteId) - Delete by ID
  - [x] removeFavoriteByTypeAndId(userId, favoriteType, favoriteId) - Delete by type/ID
  - [x] getFavoritesByUserId(userId, options) - List with filtering & pagination
  - [x] isFavorite(userId, favoriteType, favoriteId) - Boolean check
  - [x] getRestaurantFavorites(userId) - Restaurant favorites only
  - [x] getMenuItemFavorites(userId) - Menu item favorites only
  - [x] getFavoriteCount(userId) - Total count
- [x] Review Model (backend/src/models/Review.js - 309 lines)
  - [x] create(reviewData) - Create with duplicate check
  - [x] findById(reviewId) - Get single review with user info
  - [x] findByUserAndItem(userId, restaurantId, menuItemId) - Check existing
  - [x] findByRestaurantId(restaurantId, options) - Get restaurant reviews
  - [x] findByMenuItemId(menuItemId, options) - Get menu item reviews
  - [x] findByUserId(userId, options) - Get user's reviews
  - [x] update(reviewId, userId, updateData) - Update with ownership check
  - [x] delete(reviewId, userId) - Delete with ownership check
  - [x] getAverageRating(restaurantId) - Calculate avg + distribution
  - [x] getMenuItemAverageRating(menuItemId) - Simple average
- [x] Favorite Controller (backend/src/controllers/favoriteController.js - 150 lines)
  - [x] addFavorite, removeFavorite, getMyFavorites, checkFavorite
- [x] Review Controller (backend/src/controllers/reviewController.js - 180 lines)
  - [x] createReview, getRestaurantReviews, updateReview, deleteReview, getMyReviews
- [x] Routes & Validators
  - [x] backend/src/routes/favorites.js (7 endpoints)
  - [x] backend/src/routes/reviews.js (7 endpoints)
  - [x] backend/src/validators/favoriteValidator.js
  - [x] backend/src/validators/reviewValidator.js
- [x] Testing
  - [x] backend/scripts/test-favorites-reviews.js - 13/13 tests passing ✅
- [x] Order Model Fix
  - [x] Fixed schema alignment (subtotal, order_status, delivery_notes, etc.)
  - [x] Added order_number generation
  - [x] Added status field mapping
  - [x] backend/scripts/test-orders.js - 13/13 tests passing ✅

### November 16, 2025 - Week 5-6: Cart & Orders ✅ COMPLETE
- [x] Order Model & Controller
- [x] Cart Context implementation
- [x] Order Service
- [x] CartScreen, CheckoutScreen, OrdersScreen, OrderDetailScreen
- [x] Full order flow integration

### November 16, 2025 - Week 4: Restaurant & Menu Frontend ✅ COMPLETE
- [x] Restaurant Service (frontend/src/services/restaurantService.ts)
  - [x] getRestaurants with filters (search, category, pagination)
  - [x] getRestaurantById
  - [x] searchRestaurants
  - [x] getRestaurantsByCategory
  - [x] getPaginatedRestaurants
  - [x] Error handling
- [x] Menu Item Service (frontend/src/services/menuItemService.ts)
  - [x] getMenuItems with advanced filters
  - [x] getMenuItemById
  - [x] getRestaurantMenu
  - [x] getFeaturedMenuItems
  - [x] searchMenuItems
  - [x] getMenuItemsByCategory
  - [x] getPaginatedMenuItems
  - [x] Error handling
- [x] RestaurantCard Component (frontend/src/components/restaurant/RestaurantCard.tsx)
  - [x] Restaurant image with fallback
  - [x] Restaurant name and description
  - [x] Status badge (Open/Closed)
  - [x] Address and phone display
  - [x] Touchable with navigation
- [x] MenuItemCard Component (frontend/src/components/restaurant/MenuItemCard.tsx)
  - [x] Menu item image with fallback
  - [x] Name, description, price
  - [x] Rating and review count
  - [x] Preparation time
  - [x] Featured badge
  - [x] Discount badge
  - [x] Unavailable state
  - [x] Touchable interaction
- [x] SearchBar Component (frontend/src/components/common/SearchBar.tsx)
  - [x] Debounced search (500ms)
  - [x] Clear button
  - [x] Controlled/Uncontrolled modes
  - [x] Custom placeholder
  - [x] Search icon
- [x] RestaurantListScreen (frontend/src/screens/home/RestaurantListScreen.tsx)
  - [x] Restaurant list with FlatList
  - [x] Search functionality
  - [x] Pull-to-refresh
  - [x] Infinite scroll (load more)
  - [x] Loading states
  - [x] Error handling with retry
  - [x] Empty state
  - [x] Navigation to detail
- [x] RestaurantDetailScreen (frontend/src/screens/restaurant/RestaurantDetailScreen.tsx)
  - [x] Restaurant cover image
  - [x] Restaurant information display
  - [x] Status badge
  - [x] Address and phone
  - [x] Category filter chips
  - [x] Menu items list
  - [x] Pull-to-refresh
  - [x] Loading & error states
  - [x] Empty menu state

### November 16, 2025 - Week 4: Restaurant & Menu Item Backend ✅ COMPLETE
- [x] Restaurant Model & Controller (backend/src/models/Restaurant.js, backend/src/controllers/restaurantController.js)
  - [x] CRUD operations (findAll, findById, create, update, delete)
  - [x] Search and filter functionality
  - [x] Category filter support
  - [x] Pagination support
- [x] Menu Item Model & Controller (backend/src/models/MenuItem.js, backend/src/controllers/menuItemController.js)
  - [x] CRUD operations (findAll, findById, create, update, delete)
  - [x] Advanced filtering (restaurant, category, availability, featured)
  - [x] Search functionality
  - [x] Pagination support
- [x] Restaurant Routes (backend/src/routes/restaurants.js)
  - [x] GET /api/restaurants - List all restaurants
  - [x] GET /api/restaurants/:id - Get restaurant details
  - [x] POST /api/restaurants - Create restaurant (admin)
  - [x] PUT /api/restaurants/:id - Update restaurant (admin)
  - [x] DELETE /api/restaurants/:id - Delete restaurant (admin)
- [x] Menu Item Routes (backend/src/routes/menuItems.js)
  - [x] GET /api/menu-items - List all menu items with filters
  - [x] GET /api/menu-items/:id - Get menu item details
  - [x] POST /api/menu-items - Create menu item (admin)
  - [x] PUT /api/menu-items/:id - Update menu item (admin)
  - [x] DELETE /api/menu-items/:id - Delete menu item (admin)
- [x] Validators for Restaurant & Menu Items
  - [x] backend/src/validators/restaurantValidator.js (5 validators)
  - [x] backend/src/validators/menuItemValidator.js (5 validators)
- [x] Register routes in server.js
- [x] Test Scripts
  - [x] backend/scripts/test-restaurants.js (12 tests)
  - [x] backend/scripts/test-menuItems.js (16 tests)
- [x] API Documentation
  - [x] Added Restaurant API documentation to docs/API.md
  - [x] Added Menu Item API documentation to docs/API.md
  - [x] PowerShell command examples for all endpoints
  - [x] Validation rules documentation

### November 15, 2025 - Week 3: Frontend Authentication ✅ COMPLETE
- [x] Install all frontend dependencies (React Navigation, AsyncStorage, Axios, Paper, etc.)
- [x] Create Auth Service (backend/src/services/authService.ts)
  - [x] Axios instance với interceptors
  - [x] Register, Login, Profile, Update, Change Password, Logout methods
  - [x] Token management với AsyncStorage
  - [x] Error handling
- [x] Create Auth Context (frontend/src/contexts/AuthContext.tsx)
  - [x] User state management
  - [x] Login, Register, Logout functions
  - [x] UpdateProfile, ChangePassword, RefreshProfile
  - [x] Auto-load user from storage
  - [x] useAuth custom hook
- [x] Create Login Screen (frontend/src/screens/auth/LoginScreen.tsx)
  - [x] Email & Password inputs
  - [x] Form validation
  - [x] Error messages
  - [x] Navigate to Register
- [x] Create Register Screen (frontend/src/screens/auth/RegisterScreen.tsx)
  - [x] Full name, Email, Phone, Password inputs
  - [x] Comprehensive validation
  - [x] Password strength check
  - [x] Navigate to Login
- [x] Create Profile Screen (frontend/src/screens/auth/ProfileScreen.tsx)
  - [x] View profile info
  - [x] Edit profile mode
  - [x] Change password section
  - [x] Logout functionality
- [x] Setup Navigation (frontend/src/navigation/)
  - [x] Navigation types
  - [x] AuthNavigator (Login, Register)
  - [x] MainNavigator (Home, Profile với Bottom Tabs)
  - [x] Conditional navigation based on auth state
- [x] Update App.tsx
  - [x] NavigationContainer
  - [x] AuthProvider wrapper
  - [x] PaperProvider
  - [x] Loading screen
  - [x] Conditional rendering
- [x] Create Home Screen placeholder
- [x] Create comprehensive documentation
  - [x] WEEK3_FRONTEND_COMPLETE.md
  - [x] docs/WEEK3_TESTING_GUIDE.md

### November 15, 2025 - Week 3: Authentication Backend ✅ COMPLETE
- [x] Create User model (backend/src/models/User.js)
  - [x] create() with bcrypt password hashing
  - [x] findByEmail()
  - [x] findById()
  - [x] verifyPassword()
  - [x] updateLastLogin()
  - [x] update() with dynamic fields
  - [x] changePassword()
  - [x] emailExists()
- [x] Create JWT config (backend/src/config/jwt.js)
  - [x] generateToken() - 7 days expiration
  - [x] verifyToken()
- [x] Create auth middleware (backend/src/middleware/auth.js)
  - [x] authenticate() - JWT verification
  - [x] requireAdmin() - Role checking
  - [x] optionalAuth() - Optional authentication
- [x] Create validators (backend/src/validators/authValidator.js)
  - [x] Register validation (email, password, full_name, phone)
  - [x] Login validation
  - [x] Profile update validation
  - [x] Change password validation
- [x] Create auth controller (backend/src/controllers/authController.js)
  - [x] register() - User registration
  - [x] login() - User login with JWT
  - [x] getProfile() - Get user profile
  - [x] updateProfile() - Update user info
  - [x] changePassword() - Change password
  - [x] logout() - User logout
- [x] Create auth routes (backend/src/routes/auth.js)
  - [x] POST /api/auth/register
  - [x] POST /api/auth/login
  - [x] GET /api/auth/profile
  - [x] PUT /api/auth/profile
  - [x] POST /api/auth/change-password
  - [x] POST /api/auth/logout
- [x] Update server.js to use auth routes
- [x] Create comprehensive test script (backend/scripts/test-auth.js)
- [x] Create API documentation (docs/API.md)
- [x] Fix update profile bug (undefined parameters)
- [x] Run all tests - 10/10 passing ✅

### November 15, 2025 - Week 2: Database Phase ✅ COMPLETE
- [x] Create MySQL database `foodgo`
- [x] Design complete database schema (11 tables)
- [x] Create docs/DATABASE_SCHEMA.md documentation
- [x] Create backend/src/database/schema.sql migration
- [x] Implement database connection (backend/src/config/database.js)
- [x] Create error handler middleware
- [x] Update server.js with database connection test
- [x] Create health check endpoint
- [x] Create migration script (npm run migrate)
- [x] Create test database script (npm run test:db)
- [x] Create seed data script (npm run seed)
- [x] Add sample data (5 categories, 5 restaurants, 19 menu items, 3 coupons)

### November 15, 2025 - Week 1: Setup Phase ✅ COMPLETE
- [x] Initialize React Native project
- [x] Create frontend folder structure (all directories)
- [x] Create backend folder structure (all directories)
- [x] Setup backend package.json
- [x] Install backend dependencies
- [x] Create server.js with Express setup
- [x] Create .env template
- [x] Setup .gitignore
- [x] Create PROJECT_PLAN.md
- [x] Create FOLDER_STRUCTURE.md
- [x] Create README.md
- [x] Create TODO.md

---

## 🎓 LEARNING CHECKLIST

### React Native
- [ ] Component lifecycle
- [ ] State management with Context API
- [ ] Navigation patterns
- [ ] AsyncStorage usage
- [ ] SQLite integration
- [ ] Offline data handling

### Node.js & Express ✅ In Progress
- [x] RESTful API design
- [x] Middleware patterns
- [x] Error handling
- [x] JWT authentication
- [x] Database integration
- [x] Input validation

### MySQL ✅ Complete
- [x] Database design
- [x] Relations & foreign keys
- [x] Indexing for performance
- [x] Transactions

### Git & Deployment
- [ ] Git workflow
- [ ] Branch strategy
- [ ] API deployment
- [ ] Mobile app deployment

---

## 📞 QUESTIONS & BLOCKERS
- None currently!

---

**Progress Tracking:**
- Week 1: ✅ 100% Complete (Setup)
- Week 2: ✅ 100% Complete (Database)
- Week 3: ✅ 100% Complete (Authentication - Backend & Frontend)
- Week 4: ✅ 100% Complete (Restaurant & Menu - Backend & Frontend)
- Week 5-6: ✅ 100% Complete (Cart & Orders - Backend & Frontend)
- Week 7-8: ✅ 100% Complete (Favorites & Reviews - Backend & Frontend)
- Week 9-10: 🚧 0% Complete (Notifications & Real-time)
- Overall: 🚧 50% Complete (8 of 16 weeks)

**Current Status:** Week 7-8 Complete! Ready for Week 9-10 - Notifications & Real-time Tracking

**Next Actions:** 
1. Install socket.io for backend real-time communication
2. Configure WebSocket server with authentication
3. Implement order status event emissions
4. Create notification model and endpoints
5. Install @socket.io/client for frontend
6. Create socket service for real-time updates
7. Implement push notifications (react-native-push-notification)
8. Build NotificationsScreen
9. Add real-time order tracking to OrderDetailScreen
10. Test real-time features end-to-end
