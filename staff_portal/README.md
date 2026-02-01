# UHI Staff Portal - Next.js Version

A modern, responsive staff portal built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. This application has been converted from the original HTML/CSS/JavaScript codebase to a full-featured React application with improved performance, maintainability, and user experience.

## 🚀 Features

### Staff Portal

- **Dashboard**: Comprehensive overview with bio card, contract info, payments, and quick actions
- **My Contract**: View and manage employment contract details
- **Payments**: Access payslips and payment history
- **Requests**: Submit and track leave, transfer, training, and loan requests
- **Notifications**: Real-time notification system with read/unread status
- **Account Settings**: Manage profile and preferences

### Admin Portal

- **Admin Dashboard**: Statistics overview and pending applications management
- **Staff Management**: Manage staff members and their profiles
- **Application Management**: Review and process staff applications
- **Loan Management**: Oversee loan applications and repayments
- **Payroll Management**: Handle payroll processing
- **CMS Settings**: Configure content management system

### Technical Features

- ✅ **TypeScript**: Full type safety across the application
- ✅ **Authentication**: Secure JWT-based authentication with auto-refresh
- ✅ **Protected Routes**: Role-based access control (Staff/Admin)
- ✅ **Responsive Design**: Mobile-first, works on all devices
- ✅ **Modern UI**: Beautiful, premium design with animations and micro-interactions
- ✅ **API Integration**: RESTful API client with error handling
- ✅ **State Management**: React Context for global state
- ✅ **SEO Optimized**: Proper metadata and semantic HTML
- ✅ **Performance**: Optimized images, code splitting, and lazy loading

## 📁 Project Structure

```
nextjs-staff-portal/
├── public/
│   └── assets/              # Images, logos, and static files
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin portal pages
│   │   ├── dashboard/      # Staff dashboard
│   │   ├── login/          # Login page
│   │   ├── my-contract/    # Contract page
│   │   ├── payments/       # Payments page
│   │   ├── requests/       # Requests page
│   │   ├── notifications/  # Notifications page
│   │   ├── account/        # Account settings
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Landing page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   │   ├── ui/             # Reusable UI components
│   │   ├── staff/          # Staff-specific components
│   │   └── admin/          # Admin-specific components
│   ├── contexts/
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/
│   │   └── api.ts          # API client
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── .env.local.example      # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Navigate to the project directory**:

   ```bash
   cd nextjs-staff-portal
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and set your API URL:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3001](http://localhost:3001)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Colors

- **Primary**: `#002f6c` (Navy Blue)
- **Secondary**: `#d32f2f` (Red)
- **Accent**: `#ffa726` (Orange)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Error**: `#ef4444` (Red)

### Components

The application uses a custom component library with:

- Buttons (primary, secondary, outline, danger)
- Cards with hover effects
- Form inputs with validation states
- Badges for status indicators
- Modals and dropdowns
- Loading states and skeletons

### Animations

- Fade-in animations for page transitions
- Slide-in animations for modals
- Smooth hover effects
- Loading spinners
- Micro-interactions on buttons and cards

## 🔐 Authentication

The application uses JWT-based authentication with the following flow:

1. User logs in with staff ID and password
2. Server returns access token and refresh token
3. Access token is stored in sessionStorage
4. Protected routes check for valid token
5. Token auto-refreshes when expired
6. User is redirected to login if authentication fails

### API Endpoints Expected

```typescript
POST /api/v1/auth/login
POST /api/v1/auth/refresh
GET  /api/v1/staff/profile
GET  /api/v1/admin/stats
GET  /api/v1/admin/applications
PATCH /api/v1/admin/applications/:id/decision
```

## 🚦 Routing

### Entry Point

- `/` - Automatically redirects to `/login` for unauthenticated users or to the appropriate dashboard for authenticated users

### Public Routes

- `/login` - Login page (main entry point)

### Protected Routes (Staff)

- `/dashboard` - Staff dashboard
- `/my-contract` - Contract details
- `/payments` - Payslips and payments
- `/requests` - Request management
- `/notifications` - Notifications
- `/account` - Account settings

### Protected Routes (Admin)

- `/admin` - Admin dashboard
- `/admin/staff-management` - Staff management
- `/admin/applications` - Application management
- `/admin/loans` - Loan management
- `/admin/payroll` - Payroll management
- `/admin/cms-settings` - CMS settings

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔄 Migration from Original Codebase

### What Changed

1. **Framework**: HTML/CSS/JS → Next.js + React + TypeScript
2. **Routing**: Multi-page HTML → App Router with client-side navigation
3. **State Management**: Global variables → React Context + Hooks
4. **Styling**: Vanilla CSS → Tailwind CSS + CSS Modules
5. **API Calls**: Fetch in scripts → Centralized API client
6. **Authentication**: Manual token handling → Context-based auth system

### Preserved Features

- ✅ All original pages and functionality
- ✅ Same API endpoints and data structures
- ✅ Original design language and branding
- ✅ Partner organization carousel
- ✅ Notification system
- ✅ Admin approval workflow

### Improvements

- ⚡ **Performance**: Code splitting, lazy loading, optimized images
- 🎨 **UX**: Smooth animations, loading states, error handling
- 📱 **Mobile**: Better responsive design
- 🔒 **Security**: Protected routes, CSRF protection
- 🧪 **Maintainability**: TypeScript, component architecture
- ♿ **Accessibility**: ARIA labels, keyboard navigation

## 🤝 Contributing

This is a converted codebase. To add new features:

1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Update types in `src/types/`
4. Follow the existing patterns and conventions

## 📄 License

© 2025 United Health Initiative. All rights reserved.

## 🆘 Support

For issues or questions:

- Contact IT Support
- Check the HR Policy Handbook
- Review Safety Protocols

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**
