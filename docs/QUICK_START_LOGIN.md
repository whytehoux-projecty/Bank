# Quick Start Guide - New Login Flow

## 🚀 What Changed?

The login page has been **moved from the corporate website to the e-banking portal**. The e-banking portal now serves the login page as its main index page.

## 📍 New URLs

| Purpose | Old URL | New URL |
|---------|---------|---------|
| Login Page | `http://localhost:3000/login` | `http://localhost:4000/` |
| Dashboard | `http://localhost:4000/dashboard` | `http://localhost:4000/dashboard` |
| Service Unavailable | N/A | `http://localhost:4000/unavailable` |

## 🔄 User Journey

### From Corporate Website

1. User clicks "Login" button
2. **Automatically redirects** to `http://localhost:4000`
3. User sees login page
4. After login → Dashboard

### Direct Access

1. User goes to `http://localhost:4000`
2. Sees login page immediately
3. After login → Dashboard

## ⚙️ Setup Instructions

### 1. Update Environment Variables

**Corporate Website** (`corporate-website/.env.local`):

```env
NEXT_PUBLIC_PORTAL_URL=http://localhost:4000
```

**E-Banking Portal** (`e-banking-portal/.env.local`):

```env
NEXT_PUBLIC_CORPORATE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Start Services (in order)

```bash
# Terminal 1 - Backend API
cd backend
npm run dev  # Port 3001

# Terminal 2 - Corporate Website
cd corporate-website
npm run dev  # Port 3000

# Terminal 3 - E-Banking Portal
cd e-banking-portal
npm run dev  # Port 4000
```

### 3. Test the Flow

1. Open `http://localhost:3000` (corporate website)
2. Click "Login" button
3. Should redirect to `http://localhost:4000`
4. See login form
5. Enter credentials and login

## 🎨 New Features

### Service Unavailable Page

- Accessible at `/unavailable`
- Shows when backend is down
- Auto-refreshes status every 30 seconds
- Provides contact information
- Links back to corporate website

### Portal Status Indicator

- Real-time backend health check
- Shows online/offline/maintenance status
- Updates every 30 seconds
- Disables login when offline

## 🔧 Troubleshooting

### Login button doesn't redirect

- Check `NEXT_PUBLIC_PORTAL_URL` in corporate website `.env.local`
- Restart corporate website dev server

### Login page shows errors

- Verify backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in portal `.env.local`
- Check browser console for errors

### Images not loading

- Ensure images were copied to e-banking portal
- Check `/public/images` directory exists
- Restart portal dev server

### Portal shows offline

- Verify backend health endpoint: `http://localhost:3001/health`
- Check backend is running
- Check CORS configuration

## 📝 Key Files Modified

### E-Banking Portal

- `app/page.tsx` - New login page (index)
- `app/unavailable/page.tsx` - Service unavailable page
- `components/portal/PortalStatusIndicator.tsx` - Status component

### Corporate Website

- `lib/constants.ts` - Updated routes
- `app/login/page.tsx` - Redirect page
- `components/commercial/EBankingWidget.tsx` - Updated widget

## 🎯 Quick Commands

```bash
# Check if services are running
lsof -i :3000  # Corporate website
lsof -i :3001  # Backend API
lsof -i :4000  # E-Banking portal

# Restart a service
# Ctrl+C in the terminal, then npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

## ✅ Verification Steps

1. **Corporate Website** (`http://localhost:3000`):
   - Header "Login" button works
   - E-Banking widget redirects
   - Mobile menu login works

2. **E-Banking Portal** (`http://localhost:4000`):
   - Shows login page on index
   - Portal status indicator visible
   - Form validation works
   - Login redirects to dashboard

3. **Service Unavailable** (`http://localhost:4000/unavailable`):
   - Page loads with header/footer
   - Status check button works
   - Links to corporate site work

## 🆘 Need Help?

- Check full documentation: `/docs/LOGIN_FLOW_RESTRUCTURING.md`
- Review browser console for errors
- Check terminal logs for backend errors
- Verify all environment variables are set

---

**Last Updated**: 2026-01-25  
**Version**: 1.0.0
