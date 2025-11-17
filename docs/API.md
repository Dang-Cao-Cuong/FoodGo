# Authentication API Testing Guide

## Base URL
```
http://localhost:3000/api/auth
```

---

## 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "full_name": "John Doe",
  "phone": "0901234567"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "0901234567"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "full_name": "John Doe",
    "phone": "0901234567"
  }'
```

**PowerShell Command:**
```powershell
$body = @{
    email = "user@example.com"
    password = "Password123"
    full_name = "John Doe"
    phone = "0901234567"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "0901234567",
      "avatar_url": null,
      "role": "customer"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

**PowerShell Command:**
```powershell
$body = @{
    email = "user@example.com"
    password = "Password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.accessToken
Write-Host "Token: $token"
```

---

## 3. Get Profile (Protected Route)

**Endpoint:** `GET /api/auth/profile`

**Headers:**
```
Authorization: Bearer {your_access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "0901234567",
      "avatar_url": null,
      "is_verified": false,
      "role": "customer",
      "created_at": "2025-11-15T10:00:00.000Z"
    }
  }
}
```

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/profile" -Method Get -Headers $headers
```

---

## 4. Update Profile (Protected Route)

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer {your_access_token}
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone": "0909876543",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Smith",
      "phone": "0909876543",
      "avatar_url": "https://example.com/avatar.jpg",
      "is_verified": false,
      "role": "customer",
      "created_at": "2025-11-15T10:00:00.000Z"
    }
  }
}
```

**PowerShell Command:**
```powershell
$body = @{
    full_name = "John Smith"
    phone = "0909876543"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/profile" -Method Put -Body $body -ContentType "application/json" -Headers $headers
```

---

## 5. Change Password (Protected Route)

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer {your_access_token}
```

**Request Body:**
```json
{
  "currentPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**PowerShell Command:**
```powershell
$body = @{
    currentPassword = "Password123"
    newPassword = "NewPassword456"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/change-password" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

---

## 6. Logout (Protected Route)

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {your_access_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/logout" -Method Post -Headers $headers
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "status": "fail",
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "status": "fail",
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "status": "fail",
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "status": "error",
  "message": "Something went wrong!"
}
```

---

## Testing Workflow

1. **Register a new user**
   ```powershell
   # Run register command
   ```

2. **Save the token**
   ```powershell
   $token = "your_token_from_login"
   ```

3. **Test protected routes**
   ```powershell
   # Get profile
   # Update profile
   # Change password
   ```

4. **Test logout**
   ```powershell
   # Logout
   ```

---

## Validation Rules

### Email
- Must be valid email format
- Required for register & login

### Password
- Minimum 6 characters
- Must contain: uppercase, lowercase, and number
- Required for register & login

### Full Name
- Between 2-100 characters
- Required for register

### Phone
- 10-11 digits
- Optional

---

---

# Restaurant API

## Base URL
```
http://localhost:3000/api/restaurants
```

---

## 1. Get All Restaurants

**Endpoint:** `GET /api/restaurants`

**Query Parameters:**
- `q` (optional) - Search by name or description
- `categoryId` (optional) - Filter by category ID
- `limit` (optional) - Number of results (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurants": [
      {
        "id": 1,
        "name": "Pizza Palace",
        "slug": "pizza-palace",
        "description": "Best pizza in town",
        "address": "123 Main Street, District 1",
        "phone": "0281234567",
        "cover_url": "https://example.com/pizza.jpg",
        "is_open": true,
        "created_at": "2025-11-15T10:00:00.000Z"
      }
    ],
    "count": 1,
    "limit": 20,
    "offset": 0
  }
}
```

**PowerShell Command:**
```powershell
# Get all restaurants
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants" -Method Get

# Search restaurants
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants?q=pizza" -Method Get

# Filter by category
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants?categoryId=1" -Method Get

# With pagination
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants?limit=10&offset=0" -Method Get
```

---

## 2. Get Restaurant by ID

**Endpoint:** `GET /api/restaurants/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Pizza Palace",
      "slug": "pizza-palace",
      "description": "Best pizza in town",
      "address": "123 Main Street, District 1",
      "phone": "0281234567",
      "cover_url": "https://example.com/pizza.jpg",
      "is_open": true,
      "created_at": "2025-11-15T10:00:00.000Z"
    }
  }
}
```

**PowerShell Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants/1" -Method Get
```

---

## 3. Create Restaurant (Admin Only)

**Endpoint:** `POST /api/restaurants`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "Pizza Palace",
  "description": "Best pizza in town",
  "address": "123 Main Street, District 1",
  "phone": "0281234567",
  "cover_url": "https://example.com/pizza.jpg",
  "is_open": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Restaurant created successfully",
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Pizza Palace",
      "slug": "pizza-palace",
      "description": "Best pizza in town",
      "address": "123 Main Street, District 1",
      "phone": "0281234567",
      "cover_url": "https://example.com/pizza.jpg",
      "is_open": true,
      "created_at": "2025-11-15T10:00:00.000Z"
    }
  }
}
```

**PowerShell Command:**
```powershell
$body = @{
    name = "Pizza Palace"
    description = "Best pizza in town"
    address = "123 Main Street, District 1"
    phone = "0281234567"
    cover_url = "https://example.com/pizza.jpg"
    is_open = $true
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

---

## 4. Update Restaurant (Admin Only)

**Endpoint:** `PUT /api/restaurants/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "Pizza Palace - Updated",
  "description": "The best pizza in the entire city!",
  "is_open": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant updated successfully",
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Pizza Palace - Updated",
      "slug": "pizza-palace",
      "description": "The best pizza in the entire city!",
      "address": "123 Main Street, District 1",
      "phone": "0281234567",
      "cover_url": "https://example.com/pizza.jpg",
      "is_open": false,
      "created_at": "2025-11-15T10:00:00.000Z"
    }
  }
}
```

**PowerShell Command:**
```powershell
$body = @{
    name = "Pizza Palace - Updated"
    description = "The best pizza in the entire city!"
    is_open = $false
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants/1" -Method Put -Body $body -ContentType "application/json" -Headers $headers
```

---

## 5. Delete Restaurant (Admin Only)

**Endpoint:** `DELETE /api/restaurants/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant deleted successfully"
}
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/restaurants/1" -Method Delete -Headers $headers
```

---

# Menu Item API

## Base URL
```
http://localhost:3000/api/menu-items
```

---

## 1. Get All Menu Items

**Endpoint:** `GET /api/menu-items`

**Query Parameters:**
- `restaurantId` (optional) - Filter by restaurant ID
- `category` (optional) - Filter by category
- `q` (optional) - Search by name or description
- `isAvailable` (optional) - Filter by availability (true/false)
- `isFeatured` (optional) - Filter by featured status (true/false)
- `limit` (optional) - Number of results (default: 50, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "menuItems": [
      {
        "id": 1,
        "restaurant_id": 1,
        "name": "Delicious Burger",
        "slug": "delicious-burger",
        "description": "A juicy beef burger with cheese and vegetables",
        "image_url": "https://example.com/burger.jpg",
        "price": 129.99,
        "discounted_price": 99.99,
        "category": "Burgers",
        "is_available": true,
        "is_featured": true,
        "preparation_time": 15,
        "calories": 650,
        "ingredients": "Beef patty, cheese, lettuce, tomato, onion, bun",
        "allergens": "Gluten, Dairy",
        "average_rating": 4.5,
        "total_reviews": 120,
        "created_at": "2025-11-15T10:00:00.000Z"
      }
    ],
    "count": 1,
    "limit": 50,
    "offset": 0
  }
}
```

**PowerShell Commands:**
```powershell
# Get all menu items
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items" -Method Get

# Filter by restaurant
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items?restaurantId=1" -Method Get

# Search menu items
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items?q=burger" -Method Get

# Filter by category
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items?category=Burgers" -Method Get

# Filter available items
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items?isAvailable=true" -Method Get

# Filter featured items
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items?isFeatured=true" -Method Get
```

---

## 2. Get Menu Item by ID

**Endpoint:** `GET /api/menu-items/:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "name": "Delicious Burger",
    "slug": "delicious-burger",
    "description": "A juicy beef burger with cheese and vegetables",
    "image_url": "https://example.com/burger.jpg",
    "price": 129.99,
    "discounted_price": 99.99,
    "category": "Burgers",
    "is_available": true,
    "is_featured": true,
    "preparation_time": 15,
    "calories": 650,
    "ingredients": "Beef patty, cheese, lettuce, tomato, onion, bun",
    "allergens": "Gluten, Dairy",
    "average_rating": 4.5,
    "total_reviews": 120,
    "created_at": "2025-11-15T10:00:00.000Z"
  }
}
```

**PowerShell Command:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items/1" -Method Get
```

---

## 3. Create Menu Item (Admin Only)

**Endpoint:** `POST /api/menu-items`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "restaurant_id": 1,
  "name": "Delicious Burger",
  "description": "A juicy beef burger with cheese and vegetables",
  "image_url": "https://example.com/burger.jpg",
  "price": 129.99,
  "discounted_price": 99.99,
  "category": "Burgers",
  "is_available": true,
  "is_featured": true,
  "preparation_time": 15,
  "calories": 650,
  "ingredients": "Beef patty, cheese, lettuce, tomato, onion, bun",
  "allergens": "Gluten, Dairy"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "name": "Delicious Burger",
    "slug": "delicious-burger",
    "description": "A juicy beef burger with cheese and vegetables",
    "image_url": "https://example.com/burger.jpg",
    "price": 129.99,
    "discounted_price": 99.99,
    "category": "Burgers",
    "is_available": true,
    "is_featured": true,
    "preparation_time": 15,
    "calories": 650,
    "ingredients": "Beef patty, cheese, lettuce, tomato, onion, bun",
    "allergens": "Gluten, Dairy",
    "average_rating": 0,
    "total_reviews": 0,
    "created_at": "2025-11-15T10:00:00.000Z"
  }
}
```

**PowerShell Command:**
```powershell
$body = @{
    restaurant_id = 1
    name = "Delicious Burger"
    description = "A juicy beef burger with cheese and vegetables"
    image_url = "https://example.com/burger.jpg"
    price = 129.99
    discounted_price = 99.99
    category = "Burgers"
    is_available = $true
    is_featured = $true
    preparation_time = 15
    calories = 650
    ingredients = "Beef patty, cheese, lettuce, tomato, onion, bun"
    allergens = "Gluten, Dairy"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items" -Method Post -Body $body -ContentType "application/json" -Headers $headers
```

---

## 4. Update Menu Item (Admin Only)

**Endpoint:** `PUT /api/menu-items/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "name": "Updated Burger",
  "price": 139.99,
  "is_featured": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "name": "Updated Burger",
    "slug": "delicious-burger",
    "description": "A juicy beef burger with cheese and vegetables",
    "image_url": "https://example.com/burger.jpg",
    "price": 139.99,
    "discounted_price": 99.99,
    "category": "Burgers",
    "is_available": true,
    "is_featured": false,
    "preparation_time": 15,
    "calories": 650,
    "ingredients": "Beef patty, cheese, lettuce, tomato, onion, bun",
    "allergens": "Gluten, Dairy",
    "average_rating": 4.5,
    "total_reviews": 120,
    "created_at": "2025-11-15T10:00:00.000Z"
  }
}
```

**PowerShell Command:**
```powershell
$body = @{
    name = "Updated Burger"
    price = 139.99
    is_featured = $false
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items/1" -Method Put -Body $body -ContentType "application/json" -Headers $headers
```

---

## 5. Delete Menu Item (Admin Only)

**Endpoint:** `DELETE /api/menu-items/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Success Response (200):**
```json
{
  "message": "Menu item deleted successfully"
}
```

**PowerShell Command:**
```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/menu-items/1" -Method Delete -Headers $headers
```

---

## Validation Rules

### Restaurant
- **name**: 2-200 characters (required)
- **description**: max 2000 characters (optional)
- **address**: max 500 characters (required)
- **phone**: 10-11 digits (optional)
- **cover_url**: valid URL (optional)
- **is_open**: boolean (optional, default: true)

### Menu Item
- **restaurant_id**: valid integer (required)
- **name**: 2-200 characters (required)
- **description**: max 2000 characters (optional)
- **image_url**: valid URL (optional)
- **price**: positive number (required)
- **discounted_price**: positive number (optional)
- **category**: max 100 characters (optional)
- **is_available**: boolean (optional, default: true)
- **is_featured**: boolean (optional, default: false)
- **preparation_time**: 0-300 minutes (optional, default: 15)
- **calories**: positive integer (optional)
- **ingredients**: max 1000 characters (optional)
- **allergens**: max 500 characters (optional)

---

## Order API Endpoints

### Base URL
```
http://localhost:3000/api/orders
```

All order endpoints require authentication. Include the JWT token in the Authorization header.

---

### 1. Create Order

**Endpoint:** `POST /api/orders`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "restaurantId": 1,
  "deliveryAddress": "123 Main Street, Apt 4B, New York, NY 10001",
  "subtotalAmount": 35.00,
  "taxAmount": 2.45,
  "deliveryFee": 0.00,
  "totalAmount": 37.45,
  "notes": "Please ring the doorbell twice",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "price": 12.99,
      "notes": "Extra cheese"
    },
    {
      "menuItemId": 2,
      "quantity": 1,
      "price": 9.02
    }
  ]
}
```

**Success Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "id": 1,
    "user_id": 1,
    "restaurant_id": 1,
    "delivery_address": "123 Main Street, Apt 4B, New York, NY 10001",
    "total_amount": 37.45,
    "delivery_fee": 0.00,
    "tax_amount": 2.45,
    "subtotal_amount": 35.00,
    "status": "pending",
    "notes": "Please ring the doorbell twice",
    "created_at": "2025-11-16T10:30:00.000Z",
    "updated_at": "2025-11-16T10:30:00.000Z",
    "restaurant_name": "Tasty Burgers",
    "restaurant_address": "123 Food Street",
    "restaurant_phone": "0901234567",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "0901234567",
    "items": [
      {
        "id": 1,
        "order_id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "price": 12.99,
        "notes": "Extra cheese",
        "menu_item_name": "Cheeseburger",
        "menu_item_description": "Juicy beef patty with cheese",
        "menu_item_image": "https://example.com/burger.jpg"
      }
    ]
  }
}
```

**PowerShell Command:**
```powershell
$token = "your_jwt_token_here"

$body = @{
    restaurantId = 1
    deliveryAddress = "123 Main Street, Apt 4B, New York, NY 10001"
    subtotalAmount = 35.00
    taxAmount = 2.45
    deliveryFee = 0.00
    totalAmount = 37.45
    notes = "Please ring the doorbell twice"
    items = @(
        @{
            menuItemId = 1
            quantity = 2
            price = 12.99
            notes = "Extra cheese"
        },
        @{
            menuItemId = 2
            quantity = 1
            price = 9.02
        }
    )
} | ConvertTo-Json -Depth 3

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method Post -Body $body -Headers $headers
```

---

### 2. Get My Orders

**Endpoint:** `GET /api/orders/my-orders`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 20)
- `offset` (optional): Number of orders to skip (default: 0)
- `status` (optional): Filter by status (pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled)

**Success Response (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "restaurant_id": 1,
      "delivery_address": "123 Main Street",
      "total_amount": 37.45,
      "status": "pending",
      "created_at": "2025-11-16T10:30:00.000Z",
      "restaurant_name": "Tasty Burgers",
      "restaurant_image": "https://example.com/restaurant.jpg",
      "item_count": 2
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

**PowerShell Commands:**
```powershell
# Get all orders
$token = "your_jwt_token_here"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:3000/api/orders/my-orders" -Method Get -Headers $headers

# Get orders with pagination
Invoke-RestMethod -Uri "http://localhost:3000/api/orders/my-orders?limit=10&offset=0" -Method Get -Headers $headers

# Get orders by status
Invoke-RestMethod -Uri "http://localhost:3000/api/orders/my-orders?status=pending" -Method Get -Headers $headers
```

---

### 3. Get Order by ID

**Endpoint:** `GET /api/orders/:orderId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "restaurant_id": 1,
  "delivery_address": "123 Main Street, Apt 4B, New York, NY 10001",
  "total_amount": 37.45,
  "delivery_fee": 0.00,
  "tax_amount": 2.45,
  "subtotal_amount": 35.00,
  "status": "pending",
  "notes": "Please ring the doorbell twice",
  "created_at": "2025-11-16T10:30:00.000Z",
  "updated_at": "2025-11-16T10:30:00.000Z",
  "restaurant_name": "Tasty Burgers",
  "restaurant_address": "123 Food Street",
  "restaurant_phone": "0901234567",
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "user_phone": "0901234567",
  "items": [
    {
      "id": 1,
      "order_id": 1,
      "menu_item_id": 1,
      "quantity": 2,
      "price": 12.99,
      "notes": "Extra cheese",
      "menu_item_name": "Cheeseburger",
      "menu_item_description": "Juicy beef patty with cheese",
      "menu_item_image": "https://example.com/burger.jpg"
    }
  ]
}
```

**PowerShell Command:**
```powershell
$token = "your_jwt_token_here"
$orderId = 1
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId" -Method Get -Headers $headers
```

---

### 4. Get Order Statistics

**Endpoint:** `GET /api/orders/my-orders/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "total_orders": 15,
  "completed_orders": 10,
  "cancelled_orders": 2,
  "active_orders": 3,
  "total_spent": 450.50
}
```

**PowerShell Command:**
```powershell
$token = "your_jwt_token_here"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/orders/my-orders/stats" -Method Get -Headers $headers
```

---

### 5. Cancel Order

**Endpoint:** `POST /api/orders/:orderId/cancel`

**Headers:**
```
Authorization: Bearer <token>
```

**Notes:**
- Only orders with status 'pending' or 'confirmed' can be cancelled

**Success Response (200):**
```json
{
  "message": "Order cancelled successfully",
  "order": {
    "id": 1,
    "status": "cancelled",
    "updated_at": "2025-11-16T10:35:00.000Z"
  }
}
```

**PowerShell Command:**
```powershell
$token = "your_jwt_token_here"
$orderId = 1
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId/cancel" -Method Post -Headers $headers
```

---

### 6. Update Order Status (Admin/Restaurant Owner)

**Endpoint:** `PATCH /api/orders/:orderId/status`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Status Values:**
- `pending`
- `confirmed`
- `preparing`
- `ready`
- `out_for_delivery`
- `delivered`
- `cancelled`

**Success Response (200):**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": 1,
    "status": "confirmed",
    "updated_at": "2025-11-16T10:40:00.000Z"
  }
}
```

**PowerShell Command:**
```powershell
$token = "your_admin_token_here"
$orderId = 1

$body = @{
    status = "confirmed"
} | ConvertTo-Json

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/orders/$orderId/status" -Method Patch -Body $body -Headers $headers
```

---

### 7. Get Restaurant Orders (Admin/Restaurant Owner)

**Endpoint:** `GET /api/orders/restaurant/:restaurantId`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 20)
- `offset` (optional): Number of orders to skip (default: 0)
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "orders": [
    {
      "id": 1,
      "user_id": 1,
      "restaurant_id": 1,
      "total_amount": 37.45,
      "status": "pending",
      "created_at": "2025-11-16T10:30:00.000Z",
      "user_name": "John Doe",
      "user_phone": "0901234567",
      "item_count": 2
    }
  ],
  "pagination": {
    "limit": 20,
    "offset": 0
  }
}
```

**PowerShell Command:**
```powershell
$token = "your_admin_token_here"
$restaurantId = 1
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri "http://localhost:3000/api/orders/restaurant/$restaurantId" -Method Get -Headers $headers
```

---

### Order Validation Rules

**Create Order:**
- **restaurantId**: valid positive integer (required)
- **deliveryAddress**: 10-500 characters (required)
- **subtotalAmount**: positive number (required)
- **taxAmount**: positive number (required)
- **deliveryFee**: positive number (required)
- **totalAmount**: positive number (required), must match subtotal + tax + delivery fee
- **notes**: max 500 characters (optional)
- **items**: non-empty array (required)
  - **menuItemId**: valid positive integer (required)
  - **quantity**: 1-99 (required)
  - **price**: positive number (required)
  - **notes**: max 200 characters (optional)

**Update Status:**
- **status**: must be one of: pending, confirmed, preparing, ready, out_for_delivery, delivered, cancelled

**Error Responses:**

400 Bad Request:
```json
{
  "errors": [
    {
      "msg": "Delivery address must be between 10 and 500 characters",
      "param": "deliveryAddress"
    }
  ]
}
```

401 Unauthorized:
```json
{
  "message": "No token provided"
}
```

403 Forbidden:
```json
{
  "message": "Unauthorized access to order"
}
```

404 Not Found:
```json
{
  "message": "Order not found"
}
```

---

**Last Updated:** November 16, 2025

````
