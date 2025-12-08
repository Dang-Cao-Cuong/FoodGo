# Order Payment Flow Implementation

## Overview
Implemented a new order flow where orders start in "preparing" status after placement, and users can complete payment to mark orders as "delivered" or cancel them.

## Changes Made

### Backend Changes

#### 1. Order Model (`backend/src/models/Order.js`)
- **Initial Status**: Changed from `'delivered'` to `'preparing'` when creating new orders
- **Payment Status**: Added `payment_status` field (set to `'pending'` initially)
- **New Method**: Added `payOrder(orderId, userId, action)` method
  - Validates order belongs to user
  - Checks order is in `'preparing'` status
  - Checks payment_status is `'pending'`
  - Updates order based on action:
    - `'deliver'`: Sets status to `'delivered'`, payment_status to `'paid'`, and delivered_at timestamp
    - `'cancel'`: Sets status to `'cancelled'`, payment_status to `'failed'`, and cancelled_at timestamp

#### 2. Order Controller (`backend/src/controllers/orderController.js`)
- **New Endpoint**: `payOrder` controller method
  - Validates action parameter (`'deliver'` or `'cancel'`)
  - Calls `Order.payOrder()` method
  - Returns updated order with success message

#### 3. Routes (`backend/src/routes/orders.js`)
- **New Route**: `PUT /orders/:orderId/pay`
  - Requires authentication
  - Accepts `action` in request body
  - Positioned after cancel route, before status update route

### Frontend Changes

#### 1. OrderDetailScreen (`frontend/src/screens/orders/OrderDetailScreen.tsx`)
- **New State**: Added `paying` state to track payment processing
- **New Handler**: `handlePayment(action: 'deliver' | 'cancel')`
  - Shows confirmation dialog based on action
  - Calls `PUT /orders/:orderId/pay` endpoint
  - Updates local order state with response
  - Shows success/error alerts
- **UI Updates**:
  - Added "Payment" section that appears when order status is `'preparing'`
  - Two buttons in payment section:
    - **Pay & Complete**: Green button with check icon → completes payment and delivers order
    - **Cancel Order**: Red outlined button with close icon → cancels order and marks payment failed
  - Legacy cancel button still available for `'pending'` and `'confirmed'` orders (not `'preparing'`)
- **Styles**: Added `buttonContainer`, `payButton`, and `cancelPaymentButton` styles

## Order Flow

### 1. Place Order
```
User completes checkout → POST /orders
→ Order created with status: 'preparing', payment_status: 'pending'
```

### 2. Payment Options (in OrderDetailScreen)
When order status is `'preparing'`, user sees two options:

#### Option A: Pay & Complete
```
User clicks "Pay & Complete" → PUT /orders/:orderId/pay with action: 'deliver'
→ Order updated: status → 'delivered', payment_status → 'paid', delivered_at → now
→ Success message: "Payment completed! Order has been delivered."
```

#### Option B: Cancel Order
```
User clicks "Cancel Order" → PUT /orders/:orderId/pay with action: 'cancel'
→ Order updated: status → 'cancelled', payment_status → 'failed', cancelled_at → now
→ Success message: "Order has been cancelled."
```

## API Endpoints

### Create Order
- **Endpoint**: `POST /api/orders`
- **Auth**: Required
- **Response**: Order with status `'preparing'` and payment_status `'pending'`

### Pay for Order
- **Endpoint**: `PUT /api/orders/:orderId/pay`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "action": "deliver" | "cancel"
  }
  ```
- **Response**: Updated order object
- **Validations**:
  - Order must belong to authenticated user
  - Order status must be `'preparing'`
  - Payment status must be `'pending'`
  - Action must be either `'deliver'` or `'cancel'`

## Database Schema
The orders table already supports these fields:
- `order_status`: ENUM including 'preparing', 'delivered', 'cancelled'
- `payment_status`: ENUM('pending', 'paid', 'failed', 'refunded')
- `delivered_at`: TIMESTAMP for delivery completion
- `cancelled_at`: TIMESTAMP for cancellation

## User Experience

### Before
1. Place order → Order immediately marked as 'delivered'
2. No payment confirmation step
3. No way to cancel after placement

### After
1. Place order → Order status: "Preparing" (purple badge)
2. View order detail → See "Payment" section with two clear buttons
3. Choose action:
   - **Pay & Complete**: Confirms payment, marks as delivered
   - **Cancel Order**: Cancels order, marks payment failed
4. Order updates immediately with new status and timestamp

## Status Colors & Icons
- **Preparing**: Purple (#9C27B0) with chef-hat icon
- **Delivered**: Green (#4CAF50) with check-circle icon
- **Cancelled**: Red (#F44336) with close-circle icon

## Error Handling
- Token validation
- Order ownership verification
- Status validation (must be in 'preparing' status)
- Payment status validation (must be 'pending')
- Network error handling with user-friendly messages
- Loading states for all async operations

## Testing Checklist
- [ ] Place new order → Verify status is 'preparing'
- [ ] View order in OrderHistory → Verify purple "Preparing" badge
- [ ] Open OrderDetail → Verify payment buttons appear
- [ ] Click "Pay & Complete" → Verify order becomes 'delivered'
- [ ] Place another order → Click "Cancel Order" → Verify order becomes 'cancelled'
- [ ] Try to pay for already paid order → Verify error message
- [ ] Try to pay for cancelled order → Verify error message
- [ ] Verify timestamps (delivered_at, cancelled_at) are set correctly

## Future Enhancements
- Add actual payment gateway integration (Stripe, PayPal, etc.)
- Add payment method selection
- Add refund functionality
- Add order tracking with real-time updates
- Add push notifications for order status changes
- Add payment receipt generation
