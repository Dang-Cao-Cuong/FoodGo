# 🧪 Week 3 Frontend Testing Guide

**Date:** November 15, 2025

---

## 🎯 Testing Objective

Verify that the frontend authentication system works correctly with the backend API.

---

## ⚙️ Prerequisites

### 1. Backend Server Running
```bash
cd backend
npm run dev
```

**Expected Output:**
```
FoodGo API Server running on http://localhost:3000
Environment: development
✅ MySQL Database connected successfully
```

### 2. Check Backend Tests
```bash
cd backend
npm run test:auth
```

**Expected:** All 10 tests pass ✅

### 3. Frontend Dependencies Installed
```bash
cd frontend
npm install
```

---

## 📱 Running the App

### Android
```bash
cd frontend
npm run android
```

### iOS
```bash
cd frontend
npm run ios
```

### Start Metro
```bash
cd frontend
npm start
```

---

## ✅ Test Cases

### Test 1: Register New User ✅

**Steps:**
1. Open app → Should see Login screen
2. Click "Register" button
3. Fill form:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `0901234567`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
4. Click "Create Account"

**Expected Result:**
- ✅ Loading indicator appears
- ✅ No errors shown
- ✅ Navigate to Home screen
- ✅ Bottom tabs visible (Home, Profile)
- ✅ Profile tab shows user name

**Failure Cases to Test:**
- Empty email → "Email is required"
- Invalid email → "Email is invalid"
- Short password → "Password must be at least 6 characters"
- Weak password → "Password must contain uppercase, lowercase, and number"
- Non-matching passwords → "Passwords do not match"
- Short name → "Full name must be between 2-100 characters"
- Invalid phone → "Phone must be 10-11 digits"

---

### Test 2: Login Existing User ✅

**Steps:**
1. If logged in, logout first
2. Should see Login screen
3. Enter credentials:
   - Email: `john@example.com`
   - Password: `Test123456`
4. Click "Login"

**Expected Result:**
- ✅ Loading indicator appears
- ✅ Navigate to Home screen
- ✅ Profile shows correct user data

**Failure Cases:**
- Wrong password → "Invalid credentials"
- Non-existent email → "Invalid credentials"
- Empty fields → Validation errors

---

### Test 3: View Profile ✅

**Steps:**
1. Login successfully
2. Click "Profile" tab in bottom navigation

**Expected Result:**
- ✅ See user avatar with initials
- ✅ See full name
- ✅ See email
- ✅ See phone (or "Not set")
- ✅ See role badge (👤 Customer or 👑 Admin)
- ✅ See verification status
- ✅ See member since date
- ✅ "Edit Profile" button visible
- ✅ "Change Password" button visible
- ✅ "Logout" button visible

---

### Test 4: Update Profile ✅

**Steps:**
1. Go to Profile tab
2. Click "Edit Profile"
3. Change:
   - Full Name: `John Smith`
   - Phone: `0909876543`
4. Click "Save"

**Expected Result:**
- ✅ Loading indicator appears
- ✅ Success alert: "Profile updated successfully"
- ✅ Profile shows updated name and phone
- ✅ Exit edit mode

**Cancel Test:**
- Click "Edit Profile"
- Make changes
- Click "Cancel"
- ✅ Changes discarded
- ✅ Original values shown

---

### Test 5: Change Password ✅

**Steps:**
1. Go to Profile tab
2. Click "Change Password"
3. Fill form:
   - Current Password: `Test123456`
   - New Password: `NewTest123456`
   - Confirm New Password: `NewTest123456`
4. Click "Update Password"

**Expected Result:**
- ✅ Loading indicator appears
- ✅ Success alert: "Password changed successfully"
- ✅ Form cleared
- ✅ Exit password change mode

**Failure Cases:**
- Wrong current password → "Invalid current password"
- Weak new password → Validation error
- Non-matching passwords → "Passwords do not match"

---

### Test 6: Login with New Password ✅

**Steps:**
1. Logout
2. Try login with old password → Should fail
3. Login with new password → Should succeed

**Expected Result:**
- ✅ Old password rejected
- ✅ New password works
- ✅ Navigate to Home

---

### Test 7: Logout ✅

**Steps:**
1. Go to Profile tab
2. Click "Logout" button
3. Click "Logout" in confirmation dialog

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Navigate to Login screen
- ✅ Token cleared from AsyncStorage
- ✅ User data cleared

**Cancel Test:**
- Click "Logout"
- Click "Cancel" in dialog
- ✅ Stay on Profile screen
- ✅ Still logged in

---

### Test 8: Persistent Login ✅

**Steps:**
1. Login successfully
2. Close app completely
3. Reopen app

**Expected Result:**
- ✅ Brief loading screen
- ✅ Automatically navigate to Home
- ✅ No need to login again
- ✅ Profile shows correct user

---

### Test 9: Token Expiration Handling ✅

**Steps:**
1. Login successfully
2. In backend, set JWT expiration to 5 seconds (for testing)
3. Wait 6 seconds
4. Try to update profile or change password

**Expected Result:**
- ✅ API returns 401 Unauthorized
- ✅ Frontend auto-logout
- ✅ Navigate to Login screen
- ✅ User needs to login again

---

### Test 10: Network Error Handling ✅

**Steps:**
1. Stop backend server
2. Try to login

**Expected Result:**
- ✅ Error alert: "Network error. Please check your connection."
- ✅ Stay on Login screen
- ✅ No crash

**Test with:**
- Register
- Login
- Update profile
- Change password

---

## 🔄 Complete User Journey Test

### Scenario: New User Registration to Logout

1. **Register** (`john@example.com` / `Test123456`)
   - ✅ Success → Navigate to Home

2. **View Home**
   - ✅ See welcome message
   - ✅ See bottom tabs

3. **View Profile**
   - ✅ See user info
   - ✅ Avatar shows "JD"

4. **Update Profile**
   - ✅ Change name to "John Smith"
   - ✅ Add phone "0909876543"
   - ✅ Save successfully

5. **Change Password**
   - ✅ Current: `Test123456`
   - ✅ New: `NewTest123456`
   - ✅ Save successfully

6. **Logout**
   - ✅ Confirm logout
   - ✅ Return to Login

7. **Login with New Password**
   - ✅ Email: `john@example.com`
   - ✅ Password: `NewTest123456`
   - ✅ Success → Home

8. **Close App**
   - ✅ Kill app completely

9. **Reopen App**
   - ✅ Auto-login
   - ✅ See Home directly

10. **Final Logout**
    - ✅ Logout completely

**Total Time:** ~5 minutes  
**Expected Result:** All steps pass ✅

---

## 🎨 UI/UX Checks

### Visual Testing

**Login Screen:**
- ✅ Title: "Welcome Back! 👋"
- ✅ Email icon present
- ✅ Lock icon present
- ✅ Eye icon toggles password visibility
- ✅ Login button properly styled
- ✅ Register link clickable
- ✅ No UI overflow

**Register Screen:**
- ✅ Title: "Create Account 🎉"
- ✅ All 5 inputs visible
- ✅ Icons for each field
- ✅ Password toggles work
- ✅ Helper text shows errors
- ✅ Scrollable on keyboard open
- ✅ Create Account button prominent

**Profile Screen:**
- ✅ Avatar with initials
- ✅ Name, email, role displayed
- ✅ Cards properly styled
- ✅ Edit mode works
- ✅ Password change section expandable
- ✅ Logout button red/destructive color
- ✅ Scrollable content

**Navigation:**
- ✅ Bottom tabs visible
- ✅ Icons colored correctly
- ✅ Active tab highlighted
- ✅ Smooth transitions

---

## 📊 Performance Checks

### Loading Times
- Login API call: < 500ms
- Register API call: < 500ms
- Profile update: < 300ms
- Password change: < 300ms

### Memory Usage
- App startup: < 100MB
- After login: < 120MB
- After navigation: < 150MB

### Responsiveness
- UI responds to touch < 100ms
- No lag during typing
- Smooth scrolling
- No frame drops

---

## 🐛 Bug Reporting Template

```markdown
**Bug Title:** [Brief description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**
- 

**Actual Result:**
- 

**Screenshots:**
[Attach if available]

**Environment:**
- OS: Android/iOS
- Version: 
- Device: 
- Backend Running: Yes/No

**Console Errors:**
```
[Paste errors here]
```

**Priority:** High/Medium/Low
```

---

## ✅ Sign-Off Checklist

Before marking Week 3 complete, verify:

- [ ] Backend server starts without errors
- [ ] Backend tests pass (10/10)
- [ ] Frontend app builds successfully
- [ ] Register flow works
- [ ] Login flow works
- [ ] Profile view works
- [ ] Profile update works
- [ ] Password change works
- [ ] Logout works
- [ ] Persistent login works
- [ ] Error handling works
- [ ] UI looks good on Android
- [ ] UI looks good on iOS
- [ ] No console warnings
- [ ] Navigation smooth
- [ ] All buttons clickable
- [ ] Forms validate correctly
- [ ] Loading indicators show

**Status:** ✅ Ready for Week 4

---

**Tested by:** [Your Name]  
**Date:** November 15, 2025  
**Result:** PASS ✅ / FAIL ❌
