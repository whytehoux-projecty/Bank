# Next.js Staff Portal - Implementation Plan

## 🎯 Current Status: 35% Complete

**Last Updated**: January 31, 2026

---

## 📊 Phase Overview

### Phase 1: Critical Staff Pages (Priority 1) - 2 weeks

**Goal**: Implement all core staff functionality to match reference HTML

- [ ] Account Page (Password, Notifications, Preferences)
- [ ] Payments Page (Payroll, Loans, Benefits)
- [ ] My Contract Page (Employment Details)
- [ ] Requests Page (Application Forms)
- [ ] Notifications Page (Notification Center)

### Phase 2: Advanced Features (Priority 2) - 1 week

**Goal**: Add interactive features and data visualization

- [ ] PDF Generation (Payslips, Invoices)
- [ ] File Upload System
- [ ] Chart.js Integration
- [ ] QR Code Generation
- [ ] Advanced Search/Filter

### Phase 3: Admin Portal (Priority 3) - 2 weeks

**Goal**: Complete admin management interfaces

- [ ] Staff Management (CRUD)
- [ ] Application Management (Approval Workflow)
- [ ] Loan Management (Approval & Tracking)
- [ ] Payroll Management (Batch Processing)
- [ ] CMS Settings

---

## 🚀 Implementation Strategy

### Day 1-2: Account Page

**Reference**: `dev/achieve/account.html` (817 lines)

#### Components to Create

1. **AccountLayout** - Sidebar navigation
2. **MyDetailsSection** - Read-only profile display
3. **SecuritySection** - Password change form with strength meter
4. **NotificationsSection** - Email preference toggles
5. **PreferencesSection** - Language, timezone, theme selector

#### Features

- ✅ Password strength validation
- ✅ Real-time password requirements check
- ✅ Toggle switches for notifications
- ✅ Theme preview cards
- ✅ Form validation and error handling

---

### Day 3-5: Payments Page

**Reference**: `dev/achieve/payments.html` (1796 lines)

#### Components to Create

1. **PaymentsLayout** - Tab navigation (Payroll, Loans, Benefits)
2. **PayrollTab** - History table with stats
3. **LoansTab** - Loan cards with progress bars
4. **BenefitsTab** - Benefits overview
5. **LoanApplicationModal** - Multi-step loan application
6. **InvoiceModal** - Invoice display with QR code
7. **PayslipViewer** - PDF preview component

#### Features

- ✅ Payroll history table with download
- ✅ Loan application form
- ✅ Invoice generation with QR codes
- ✅ Payment tracking
- ✅ PDF export functionality
- ✅ Chart.js for financial visualizations

---

### Day 6-7: My Contract Page

**Reference**: `dev/achieve/my-contract.html`

#### Components to Create

1. **ContractOverview** - Current contract details
2. **EmploymentHistory** - Timeline view
3. **DocumentsList** - Downloadable documents
4. **DeploymentInfo** - Current deployment status

#### Features

- ✅ Contract details display
- ✅ Employment timeline
- ✅ Document management
- ✅ Deployment tracking

---

### Day 8-9: Requests Page

**Reference**: `dev/achieve/requests.html`

#### Components to Create

1. **RequestsLayout** - New request + history tabs
2. **LeaveRequestForm** - Leave application
3. **TransferRequestForm** - Transfer application
4. **TrainingRequestForm** - Training application
5. **LoanRequestForm** - Loan application
6. **RequestsList** - Application history with status

#### Features

- ✅ Multi-type request forms
- ✅ Form validation
- ✅ File attachments
- ✅ Status tracking
- ✅ Request history

---

### Day 10: Notifications Page

**Reference**: `dev/achieve/notifications.html`

#### Components to Create

1. **NotificationCenter** - Inbox-style layout
2. **NotificationFilters** - All/Unread tabs
3. **NotificationItem** - Individual notification
4. **NotificationDetail** - Expanded view

#### Features

- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Filter by type
- ✅ Search functionality

---

## 🛠️ Technical Implementation Details

### Reusable Components Library

#### Forms

```typescript
// src/components/ui/Form/
- Input.tsx          // Text input with validation
- Select.tsx         // Dropdown select
- Textarea.tsx       // Multi-line text
- Checkbox.tsx       // Checkbox with label
- Toggle.tsx         // Toggle switch
- DatePicker.tsx     // Date selection
- FileUpload.tsx     // File upload with preview
- PasswordInput.tsx  // Password with show/hide
```

#### UI Elements

```typescript
// src/components/ui/
- Modal.tsx          // Reusable modal
- Tabs.tsx           // Tab navigation
- Card.tsx           // Card container
- Badge.tsx          // Status badges
- Button.tsx         // Button variants
- Table.tsx          // Data table
- Alert.tsx          // Alert messages
- Spinner.tsx        // Loading spinner
```

#### Data Display

```typescript
// src/components/ui/
- ProgressBar.tsx    // Progress indicator
- Timeline.tsx       // Timeline view
- StatCard.tsx       // Statistics card
- Chart.tsx          // Chart wrapper
```

---

### API Integration Points

#### Staff Endpoints

```typescript
// Account
PUT  /api/v1/auth/change-password
PUT  /api/v1/staff/profile/notifications
PUT  /api/v1/staff/profile/preferences

// Payments
GET  /api/v1/finance/payroll
GET  /api/v1/finance/payroll/:id/pdf
GET  /api/v1/finance/loans
POST /api/v1/finance/loans
POST /api/v1/finance/loans/:id/invoice
GET  /api/v1/finance/benefits

// Contract
GET  /api/v1/staff/employment
GET  /api/v1/staff/documents

// Requests
GET  /api/v1/applications
POST /api/v1/applications
GET  /api/v1/applications/:id

// Notifications
GET  /api/v1/staff/notifications
PUT  /api/v1/staff/notifications/:id/read
PUT  /api/v1/staff/notifications/read-all
```

---

### State Management Strategy

#### Local State (useState)

- Form inputs
- UI toggles (modals, dropdowns)
- Loading states

#### Context State (useContext)

- User authentication
- Global notifications
- Theme preferences

#### Server State (React Query - Optional)

- API data caching
- Automatic refetching
- Optimistic updates

---

## 📋 Implementation Checklist

### Week 1: Core Pages

#### Day 1-2: Account Page

- [ ] Create AccountLayout component
- [ ] Implement My Details section
- [ ] Build Security section with password form
- [ ] Add password strength meter
- [ ] Create Notifications preferences
- [ ] Build Preferences section
- [ ] Add theme selector
- [ ] Integrate with API endpoints
- [ ] Add form validation
- [ ] Test all functionality

#### Day 3-5: Payments Page

- [ ] Create PaymentsLayout with tabs
- [ ] Build Payroll tab with table
- [ ] Add stats cards
- [ ] Create Loans tab
- [ ] Build loan card component
- [ ] Create loan application modal
- [ ] Add invoice generation
- [ ] Implement QR code display
- [ ] Add PDF export
- [ ] Build Benefits tab
- [ ] Integrate Chart.js
- [ ] Connect to API endpoints
- [ ] Test all flows

#### Day 6-7: My Contract

- [ ] Create contract overview
- [ ] Build employment timeline
- [ ] Add documents list
- [ ] Implement deployment info
- [ ] Connect to API
- [ ] Add download functionality

#### Day 8-9: Requests Page

- [ ] Create requests layout
- [ ] Build leave request form
- [ ] Build transfer request form
- [ ] Build training request form
- [ ] Create requests history
- [ ] Add status badges
- [ ] Implement file upload
- [ ] Connect to API
- [ ] Add validation

#### Day 10: Notifications

- [ ] Create notification center
- [ ] Build notification list
- [ ] Add filters
- [ ] Implement mark as read
- [ ] Add delete functionality
- [ ] Connect to API

### Week 2: Polish & Testing

#### Day 11-12: UI Components

- [ ] Create reusable form components
- [ ] Build modal component
- [ ] Create tabs component
- [ ] Add table component
- [ ] Build chart wrapper
- [ ] Create progress bar
- [ ] Add timeline component

#### Day 13-14: Integration & Testing

- [ ] Test all pages
- [ ] Fix bugs
- [ ] Add error handling
- [ ] Optimize performance
- [ ] Add loading states
- [ ] Test responsive design
- [ ] Cross-browser testing

---

## 🎨 Design System Reference

### Colors (from reference HTML)

```css
--primary-color: #002f6c;
--primary-dark: #001f4d;
--secondary-color: #d32f2f;
--accent-color: #ffa726;
--success-color: #10b981;
--warning-color: #f59e0b;
--error-color: #ef4444;
```

### Typography

```css
Font Family: 'Inter', sans-serif
Headings: 600-700 weight
Body: 400 weight
Small: 0.875rem
Base: 1rem
Large: 1.125rem
```

### Spacing

```css
Gap: 1rem (16px)
Padding: 1.5rem (24px)
Margin: 1rem (16px)
Border Radius: 0.5rem (8px)
```

---

## 📦 Dependencies to Add

```json
{
  "dependencies": {
    "chart.js": "^4.4.1",
    "react-chartjs-2": "^5.2.0",
    "qrcode.react": "^3.1.0",
    "html2pdf.js": "^0.10.1",
    "date-fns": "^3.0.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4"
  }
}
```

---

## 🚦 Success Criteria

### Functionality

- ✅ All forms submit successfully
- ✅ All API calls work
- ✅ PDF generation works
- ✅ File uploads work
- ✅ All validations pass

### Performance

- ✅ Page load < 2s
- ✅ No layout shifts
- ✅ Smooth animations
- ✅ Optimized images

### Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Color contrast

### Responsive

- ✅ Mobile (375px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ Large (1440px+)

---

## 📈 Progress Tracking

**Current**: 35% Complete
**Target Week 1**: 70% Complete
**Target Week 2**: 100% Complete

---

*Plan created: January 31, 2026*
*Estimated completion: February 14, 2026*
