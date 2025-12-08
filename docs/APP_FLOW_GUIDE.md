# 📱 FoodGo App - Hướng Dẫn Chi Tiết Luồng Hoạt Động & Code Map

Tài liệu này mô tả chi tiết các luồng hoạt động chính của ứng dụng FoodGo, ánh xạ trực tiếp đến các file code và dòng code cụ thể để dễ dàng theo dõi và debug.

> **Lưu ý**: Số dòng code (Line) là ước lượng và có thể thay đổi khi code được chỉnh sửa. Hãy tìm kiếm theo từ khóa hoặc tên hàm nếu dòng code không chính xác.

## 📋 Mục Lục
1. [Hệ Thống Navigation (Điều Hướng)](#1-hệ-thống-navigation)
2. [Authentication Flow (Đăng Ký & Đăng Nhập)](#2-authentication-flow)
3. [Home & Restaurant Flow (Trang Chủ & Nhà Hàng)](#3-home--restaurant-flow)
4. [Cart & Order Flow (Giỏ Hàng & Đặt Hàng)](#4-cart--order-flow)
5. [Favorites Flow (Yêu Thích)](#5-favorites-flow)
6. [Profile Flow (Hồ Sơ Cá Nhân)](#6-profile-flow)

---

## 1. Hệ Thống Navigation

Hệ thống điều hướng quyết định màn hình nào được hiển thị dựa trên trạng thái đăng nhập của người dùng.

### 📂 File: `frontend/src/navigation/AppNavigator.tsx` (hoặc `App.tsx`)

**Luồng hoạt động:**
1.  **Kiểm tra trạng thái Auth**: `useAuth()` hook cung cấp `isAuthenticated` và `isLoading`.
2.  **Điều hướng có điều kiện**:
    *   Nếu `isLoading` = true: Hiển thị màn hình Loading (Splash).
    *   Nếu `isAuthenticated` = true: Hiển thị `MainNavigator` (App chính).
    *   Nếu `isAuthenticated` = false: Hiển thị `AuthNavigator` (Màn hình Login/Register).

### 📂 File: `frontend/src/navigation/AuthNavigator.tsx`
*Quản lý các màn hình khi chưa đăng nhập.*

*   **Line 9-19**: Định nghĩa `Stack.Navigator` với `headerShown: false`.
*   **Line 15**: `LoginScreen` - Màn hình đăng nhập.
*   **Line 16**: `RegisterScreen` - Màn hình đăng ký.

### 📂 File: `frontend/src/navigation/MainNavigator.tsx`
*Quản lý các màn hình chính sau khi đăng nhập.*

*   **Line 21-95 (`MainTabNavigator`)**: Định nghĩa thanh menu dưới đáy (Bottom Tabs).
    *   **Tab Home**: `HomeScreen`
    *   **Tab Cart**: `CartScreen` (có badge số lượng item - **Line 50-54**)
    *   **Tab Favorites**: `FavoritesScreen`
    *   **Tab Orders**: `OrderHistoryScreen`
    *   **Tab Profile**: `ProfileScreen`
    *   **Style**: Header màu đỏ (`#FF6B6B`), text trắng (**Line 26-30**).

*   **Line 98-133 (`MainNavigator`)**: Định nghĩa Stack chính bao trùm Tabs.
    *   **Line 101**: `MainTabs` (Chứa 5 tab ở trên).
    *   **Line 106**: `RestaurantDetail` (Chi tiết nhà hàng).
    *   **Line 111**: `Cart` (Màn hình giỏ hàng - truy cập từ Stack).
    *   **Line 116**: `Checkout` (Thanh toán).
    *   **Line 127**: `OrderDetail` (Chi tiết đơn hàng).

---

## 2. Authentication Flow

### A. Đăng Ký (Register)

#### 📱 Frontend: `frontend/src/screens/auth/RegisterScreen.tsx`
*   **Line 27-33**: State `formData` chứa email, password, name, phone.
*   **Line 58-104**: Hàm `validate()` kiểm tra input (email đúng định dạng, pass > 6 ký tự...).
*   **Line 109-125**: Hàm `handleRegister()`:
    *   Gọi `register(formData)` từ `AuthContext`.
    *   Nếu lỗi: Hiển thị `Alert.alert`.

#### 🔄 Context: `frontend/src/contexts/AuthContext.tsx`
*   **Line 85-115 (`register` function)**:
    *   Gửi POST request tới `/auth/register`.
    *   Lưu token vào `AsyncStorage` (`@foodgo_token`).
    *   Cập nhật state `user` và `isAuthenticated`.

#### 🔙 Backend: `backend/src/controllers/authController.js`
*   **Hàm `register`**:
    1.  Nhận body: email, password, full_name, phone.
    2.  Check email tồn tại: `User.emailExists(email)`.
    3.  Tạo user mới: `User.create(...)` (Password được hash tại Model).
    4.  Tạo JWT token: `generateAuthTokens(user)`.
    5.  Trả về: User info + Access Token.

---

### B. Đăng Nhập (Login)

#### 📱 Frontend: `frontend/src/screens/auth/LoginScreen.tsx`
*   **Line 23-25**: State `email`, `password`.
*   **Line 27-38**: Hàm `handleLogin()`:
    *   Validate input rỗng.
    *   Gọi `login({ email, password })` từ `AuthContext`.

#### 🔄 Context: `frontend/src/contexts/AuthContext.tsx`
*   **Line 145-175 (`login` function)**:
    *   Gửi POST request tới `/auth/login`.
    *   Nhận `accessToken` và `user`.
    *   Lưu vào `AsyncStorage`.
    *   `setUser(user)`, `setIsAuthenticated(true)`.

#### 🔙 Backend: `backend/src/controllers/authController.js`
*   **Hàm `login`**:
    1.  Tìm user: `User.findByEmail(email)`.
    2.  Verify password: `User.verifyPassword(password, user.password_hash)` (Dùng bcrypt).
    3.  Update `last_login`.
    4.  Trả về token + user info.

---

## 3. Home & Restaurant Flow

### A. Hiển Thị Danh Sách Nhà Hàng

#### 📱 Frontend: `frontend/src/screens/home/HomeScreen.tsx`
*   **Line 45**: `useEffect` gọi `fetchRestaurants()`.
*   **Hàm `fetchRestaurants`**:
    *   Gọi API `GET /restaurants`.
    *   Set state `restaurants`.
*   **Line 150+**: Render `FlatList` chứa các `RestaurantCard`.

#### 🔙 Backend: `backend/src/controllers/restaurantController.js`
*   **Hàm `getRestaurants`**:
    *   Nhận query params: `q` (search), `categoryId`, `limit`.
    *   Gọi `Restaurant.findAll(...)`.
    *   Trả về danh sách nhà hàng.

### B. Chi Tiết Nhà Hàng & Menu

#### 📱 Frontend: `frontend/src/screens/restaurant/RestaurantDetailScreen.tsx`
*   **Line 65**: `useEffect` gọi `fetchRestaurantDetails()` và `fetchMenuItems()`.
*   **Hàm `fetchMenuItems`**:
    *   Gọi API `GET /restaurants/{id}/menu-items`.
    *   Set state `menuItems`.
*   **Line 250+**: Render `FlatList` các `MenuItemCard`.
    *   Mỗi `MenuItemCard` có nút "+" để thêm vào giỏ hàng.

---

## 4. Cart & Order Flow

### A. Thêm Vào Giỏ Hàng
 
 #### 🔄 Context: `frontend/src/contexts/CartContext.tsx`
 *   **Line 142 (`addToCart` function)**:
     *   **Line 149**: Logic kiểm tra nhà hàng (Single Restaurant Cart):
         *   So sánh `restaurantId` hiện tại trong giỏ với item mới.
         *   Nếu khác nhau (`mismatch`): Trả về lỗi thay vì tự động thêm/clear -> UI sẽ hiển thị Confirm Dialog.
         *   Hỗ trợ `forceNewOrder`: Nếu user đồng ý -> Clear giỏ hàng cũ và thêm item mới.
     *   **Line 156**: Tạo ID duy nhất cho item trong giỏ (`menuItemId-restaurantId`).
     *   **Line 159**: Nếu item đã có -> Tăng số lượng (`quantity`).
     *   **Line 167**: Nếu chưa có -> Thêm mới vào mảng `cartItems`.
     *   **Line 90**: `useEffect` tự động lưu giỏ hàng vào `AsyncStorage` mỗi khi `cartItems` thay đổi.
 
 #### 📱 Component: `frontend/src/components/restaurant/MenuItemCard.tsx`
 *   **Hàm `handleAddToCart`**:
     *   Gọi `addToCart` context.
     *   Nếu trả về lỗi `mismatch`: Hiển thị `Alert` hỏi user "Start new order?".
     *   Nếu user chọn "New Order": Gọi lại `addToCart` với tham số `forceNewOrder=true`.
 
 ### B. Xem Giỏ Hàng & Tính Toán

#### 📱 Frontend: `frontend/src/screens/cart/CartScreen.tsx`
*   **Line 24**: Lấy `cartItems`, `subtotal`, `total` từ `useCart()`.
*   **Line 133**: Render danh sách item.
*   **Line 70 (`renderSummary`)**: Hiển thị tổng tiền, thuế, phí ship.

#### 🔄 Context: `frontend/src/contexts/CartContext.tsx`
*   **Line 122**: Tính `subtotal` (Tổng tiền hàng).
*   **Line 128**: Tính `tax` (7% của subtotal).
*   **Line 131**: Tính `deliveryFee` (Mặc định 0 hoặc lấy từ config).
*   **Line 136**: Tính `total` = subtotal + tax + deliveryFee.

### C. Đặt Hàng (Checkout)

#### 📱 Frontend: `frontend/src/screens/checkout/CheckoutScreen.tsx`
*   User nhập địa chỉ, ghi chú.
*   Nút "Place Order" gọi hàm `handlePlaceOrder`.

#### 🔄 Context: `frontend/src/contexts/CartContext.tsx` (hoặc OrderService)
*   **Hàm `placeOrder`**:
    *   Chuẩn bị payload: `items`, `totalAmount`, `address`, `restaurantId`.
    *   Gọi API `POST /orders`.
    *   Nếu thành công -> `clearCart()` -> Navigate tới `OrderSuccess`.

#### 🔙 Backend: `backend/src/controllers/orderController.js`
*   **Hàm `createOrder`**:
    1.  Bắt đầu Transaction DB.
    2.  Insert vào bảng `orders`.
    3.  Loop qua `items` -> Insert vào bảng `order_items`.
    4.  Commit Transaction.
    5.  Trả về Order ID.

---

## 5. Favorites Flow

### A. Toggle Favorite (Thả Tim)

#### 📱 Frontend: `frontend/src/components/common/FavoriteButton.tsx`
*   **Line 32**: Nhận props `id` (restaurant/menu ID) và `type`.
*   **Line 46**: `useEffect` gọi `loadFavoriteStatus` khi component mount.
*   **Line 108 (`handleToggle`)**:
    *   Check login (`!user` -> return).
    *   **Optimistic Update**: `setIsFavorited(!isFavorited)` ngay lập tức để UI mượt.
    *   Gọi API `POST /favorites/toggle`.
    *   Nếu API lỗi -> Revert state cũ.

#### 🔙 Backend: `backend/src/controllers/favoriteController.js`
*   **Hàm `toggleFavorite`**:
    *   Check xem user đã like chưa.
    *   Nếu có -> Delete (Unlike).
    *   Nếu chưa -> Insert (Like).
    *   Trả về trạng thái mới (`is_favorite: true/false`).

---

## 6. Profile Flow

### A. Cập Nhật Thông Tin

#### 📱 Frontend: `frontend/src/screens/auth/ProfileScreen.tsx`
*   **Line 37**: State `isEditing` để chuyển đổi giữa chế độ Xem/Sửa.
*   **Line 63 (`handleUpdateProfile`)**:
    *   Gọi `updateProfile(data)` từ `AuthContext`.
    *   Hiển thị Alert thành công/thất bại.

#### 🔄 Context: `frontend/src/contexts/AuthContext.tsx`
*   **Hàm `updateProfile`**:
    *   Gọi API `PUT /users/profile`.
    *   Cập nhật lại state `user` cục bộ và `AsyncStorage`.

### B. Đổi Mật Khẩu

#### 📱 Frontend: `frontend/src/screens/auth/ProfileScreen.tsx`
*   **Line 123 (`handleChangePassword`)**:
    *   Validate: Pass cũ, Pass mới (độ dài, ký tự đặc biệt), Confirm pass.
    *   Gọi `changePassword()` từ `AuthContext`.

#### 🔙 Backend: `backend/src/controllers/userController.js`
*   **Hàm `changePassword`**:
    1.  Lấy user từ DB.
    2.  Check pass cũ (`bcrypt.compare`).
    3.  Hash pass mới (`bcrypt.hash`).
    4.  Update DB.
