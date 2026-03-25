# ✅ Login Flow Restructuring - Testing Checklist

Use this checklist to verify that all components of the login flow restructuring are working correctly.

## 🔧 Pre-Testing Setup

- [ ] All services are running:
  - [ ] Backend API on port 3001
  - [ ] Corporate Website on port 3000
  - [ ] E-Banking Portal on port 4000
  - [ ] Admin Interface on port 3003 (optional)

- [ ] Environment variables are set:
  - [ ] Corporate Website `.env.local` has `NEXT_PUBLIC_PORTAL_URL=http://localhost:4000`
  - [ ] E-Banking Portal `.env.local` has `NEXT_PUBLIC_CORPORATE_URL=http://localhost:3000`
  - [ ] E-Banking Portal `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:3001`

---

## 📱 Corporate Website Tests

### Header Navigation

- [ ] Visit `http://localhost:3000`
- [ ] Click "Login" button in header
- [ ] **Expected**: Redirects to `http://localhost:4000`
- [ ] **Actual**: _____________________

### Mobile Menu

- [ ] Open mobile menu (resize browser or use mobile view)
- [ ] Click "Login" button in mobile menu
- [ ] **Expected**: Redirects to `http://localhost:4000`
- [ ] **Actual**: _____________________

### E-Banking Widget (Homepage)

- [ ] Scroll to hero section with E-Banking widget
- [ ] Enter any account number and password
- [ ] Click "Sign In to Your Account"
- [ ] **Expected**: Redirects to `http://localhost:4000`
- [ ] **Actual**: _____________________

### Direct Login Route

- [ ] Visit `http://localhost:3000/login` directly
- [ ] **Expected**: Shows loading spinner, then redirects to `http://localhost:4000`
- [ ] **Actual**: _____________________

---

## 🏦 E-Banking Portal Tests

### Index Page (Login)

- [ ] Visit `http://localhost:4000`
- [ ] **Expected**: Shows login page (not dashboard)
- [ ] **Actual**: _____________________

- [ ] Login page displays:
  - [ ] Background image loads
  - [ ] "E-Banking Portal" title
  - [ ] Portal status indicator (green "ONLINE" badge)
  - [ ] Account number input field
  - [ ] Password input field
  - [ ] "Remember me" checkbox
  - [ ] "Forgot password?" link
  - [ ] "Sign In to Your Account" button
  - [ ] "Register for E-Banking" link
  - [ ] Security notice (256-bit SSL)
  - [ ] "New to AURUM VAULT?" section
  - [ ] "Open an Account" button

### Portal Status Indicator

- [ ] Status indicator shows "ONLINE" with green badge
- [ ] **Expected**: Green background, WiFi icon, "ONLINE" text
- [ ] **Actual**: _____________________

- [ ] Stop backend API (Ctrl+C in backend terminal)
- [ ] Wait 30 seconds
- [ ] **Expected**: Status changes to "OFFLINE" with red badge
- [ ] **Actual**: _____________________

- [ ] Restart backend API
- [ ] Wait 30 seconds
- [ ] **Expected**: Status changes back to "ONLINE"
- [ ] **Actual**: _____________________

### Form Validation

- [ ] Click "Sign In" without entering anything
- [ ] **Expected**: Shows validation errors
- [ ] **Actual**: _____________________

- [ ] Enter invalid account number (e.g., "123")
- [ ] Click "Sign In"
- [ ] **Expected**: Shows "Account number must be 10-12 digits" error
- [ ] **Actual**: _____________________

- [ ] Enter valid account number (10-12 digits)
- [ ] Enter short password (e.g., "pass")
- [ ] Click "Sign In"
- [ ] **Expected**: Shows "Password must be at least 8 characters" error
- [ ] **Actual**: _____________________

### Successful Login

- [ ] Enter valid credentials:
  - Account Number: `1234567890`
  - Password: `password123`
- [ ] Click "Sign In to Your Account"
- [ ] **Expected**: Redirects to `/dashboard`
- [ ] **Actual**: _____________________

- [ ] Dashboard loads successfully
- [ ] User name appears in dashboard header
- [ ] **Expected**: "Welcome back, [FirstName]"
- [ ] **Actual**: _____________________

### External Links

- [ ] Click "Register for E-Banking →" link
- [ ] **Expected**: Redirects to `http://localhost:3000/signup`
- [ ] **Actual**: _____________________

- [ ] Go back to login page
- [ ] Click "Open an Account" button
- [ ] **Expected**: Redirects to `http://localhost:3000/apply`
- [ ] **Actual**: _____________________

---

## 🚫 Service Unavailable Page

### Direct Access

- [ ] Visit `http://localhost:4000/unavailable`
- [ ] **Expected**: Shows service unavailable page
- [ ] **Actual**: _____________________

- [ ] Page displays:
  - [ ] Corporate-style header with logo
  - [ ] "Back to Website" button in header
  - [ ] Animated WiFi-off icon
  - [ ] "Service Temporarily Unavailable" title
  - [ ] Description text
  - [ ] Red status card with offline message
  - [ ] "Check Status" button
  - [ ] "Return to Homepage" button
  - [ ] Contact information (phone, email)
  - [ ] Corporate-style footer

### Auto-Refresh Feature

- [ ] Note the "Status checked X times" counter
- [ ] Wait 30 seconds
- [ ] **Expected**: Counter increments automatically
- [ ] **Actual**: _____________________

### Manual Refresh

- [ ] Click "Check Status" button
- [ ] **Expected**: Button shows "Checking..." with spinning icon
- [ ] **Actual**: _____________________

- [ ] Counter increments
- [ ] **Expected**: Counter shows one more check
- [ ] **Actual**: _____________________

### Navigation Links

- [ ] Click "Back to Website" in header
- [ ] **Expected**: Redirects to `http://localhost:3000`
- [ ] **Actual**: _____________________

- [ ] Go back to unavailable page
- [ ] Click "Return to Homepage" button
- [ ] **Expected**: Redirects to `http://localhost:3000`
- [ ] **Actual**: _____________________

- [ ] Go back to unavailable page
- [ ] Click phone number link
- [ ] **Expected**: Opens phone dialer (on mobile) or shows number
- [ ] **Actual**: _____________________

- [ ] Click email link
- [ ] **Expected**: Opens email client
- [ ] **Actual**: _____________________

---

## 🔄 Integration Tests

### Full Login Flow

- [ ] Start at corporate website homepage
- [ ] Click "Login" in header
- [ ] Verify redirect to portal
- [ ] Enter valid credentials
- [ ] Click "Sign In"
- [ ] Verify redirect to dashboard
- [ ] **Expected**: Complete flow works smoothly
- [ ] **Actual**: _____________________

### Cross-Origin Requests

- [ ] Login successfully
- [ ] Open browser DevTools → Network tab
- [ ] Check for CORS errors
- [ ] **Expected**: No CORS errors
- [ ] **Actual**: _____________________

### Token Storage

- [ ] Login successfully
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Check for `accessToken` and `refreshToken`
- [ ] **Expected**: Both tokens are stored
- [ ] **Actual**: _____________________

### Session Persistence

- [ ] Login successfully
- [ ] Refresh the dashboard page
- [ ] **Expected**: Stays logged in, doesn't redirect to login
- [ ] **Actual**: _____________________

---

## 🎨 Visual/UI Tests

### Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] **Expected**: All elements display correctly on all sizes
- [ ] **Actual**: _____________________

### Images

- [ ] All images load correctly:
  - [ ] Background image on login page
  - [ ] Logo in header (unavailable page)
  - [ ] Logo in footer (unavailable page)
- [ ] **Expected**: No broken images
- [ ] **Actual**: _____________________

### Animations

- [ ] Portal status indicator animates when checking
- [ ] Service unavailable icon has pulsing animation
- [ ] Buttons have hover effects
- [ ] **Expected**: Smooth animations, no jank
- [ ] **Actual**: _____________________

---

## 🐛 Error Handling Tests

### Invalid Credentials

- [ ] Enter invalid credentials
- [ ] Click "Sign In"
- [ ] **Expected**: Shows error message "Login failed. Please check your credentials."
- [ ] **Actual**: _____________________

### Backend Offline During Login

- [ ] Stop backend API
- [ ] Try to login
- [ ] **Expected**: Form is disabled, shows offline message
- [ ] **Actual**: _____________________

### Network Error

- [ ] Disconnect internet (or use DevTools offline mode)
- [ ] Try to login
- [ ] **Expected**: Shows appropriate error message
- [ ] **Actual**: _____________________

---

## 📊 Performance Tests

### Page Load Times

- [ ] Login page loads in < 2 seconds
- [ ] Service unavailable page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds after login
- [ ] **Expected**: All pages load quickly
- [ ] **Actual**: _____________________

### API Response Times

- [ ] Health check responds in < 500ms
- [ ] Login API responds in < 1 second
- [ ] **Expected**: Fast API responses
- [ ] **Actual**: _____________________

---

## 🔐 Security Tests

### Password Visibility Toggle

- [ ] Click eye icon in password field
- [ ] **Expected**: Password becomes visible
- [ ] **Actual**: _____________________

- [ ] Click eye icon again
- [ ] **Expected**: Password becomes hidden
- [ ] **Actual**: _____________________

### Remember Me

- [ ] Check "Remember me" checkbox
- [ ] Login successfully
- [ ] **Expected**: Checkbox state is saved (for future implementation)
- [ ] **Actual**: _____________________

### Forgot Password Link

- [ ] Click "Forgot password?" link
- [ ] **Expected**: Link exists (functionality to be implemented)
- [ ] **Actual**: _____________________

---

## 📝 Documentation Tests

### README

- [ ] README.md updated with new login flow section
- [ ] Instructions are clear and accurate
- [ ] **Expected**: Documentation matches implementation
- [ ] **Actual**: _____________________

### Quick Start Guide

- [ ] `/docs/QUICK_START_LOGIN.md` exists
- [ ] Guide is easy to follow
- [ ] **Expected**: Can set up and test using guide
- [ ] **Actual**: _____________________

### Architecture Diagrams

- [ ] `/docs/ARCHITECTURE_LOGIN_FLOW.md` exists
- [ ] Diagrams are clear and accurate
- [ ] **Expected**: Diagrams match actual implementation
- [ ] **Actual**: _____________________

---

## ✅ Final Verification

### All Tests Passed

- [ ] All corporate website tests passed
- [ ] All e-banking portal tests passed
- [ ] All service unavailable tests passed
- [ ] All integration tests passed
- [ ] All visual/UI tests passed
- [ ] All error handling tests passed
- [ ] All performance tests passed
- [ ] All security tests passed
- [ ] All documentation tests passed

### Issues Found

List any issues discovered during testing:

1. _____________________
2. _____________________
3. _____________________

### Notes

Additional observations or comments:

_____________________
_____________________
_____________________

---

## 🎯 Sign-Off

**Tested By**: _____________________  
**Date**: _____________________  
**Status**: ⬜ Passed | ⬜ Failed | ⬜ Needs Fixes  
**Ready for Production**: ⬜ Yes | ⬜ No

---

**Next Steps**:

- [ ] Fix any issues found
- [ ] Re-test failed items
- [ ] Update documentation if needed
- [ ] Prepare for production deployment
