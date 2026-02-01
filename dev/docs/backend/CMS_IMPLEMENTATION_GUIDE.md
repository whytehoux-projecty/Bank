# 🎨 Content Management System (CMS) - Implementation Guide

> **Purpose**: Enable administrators to dynamically update logos, text, and branding across the Staff Portal without code changes.

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Admin Interface Design](#2-admin-interface-design)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Integration](#4-frontend-integration)
5. [Step-by-Step Implementation](#5-step-by-step-implementation)
6. [Security Considerations](#6-security-considerations)

---

## 1. Overview

### What Can Admins Change?

| Category | Editable Items | Type |
|----------|---------------|------|
| **Branding** | Organization Logo (Header) | Image Upload |
| | Organization Logo (Login) | Image Upload |
| | Logo for Dark Backgrounds | Image Upload |
| | Primary Brand Color | Color Picker |
| | Secondary Brand Color | Color Picker |
| **Login Page** | Background Image | Image Upload |
| | Portal Title | Text |
| | Subtitle | Text |
| | Support Email | Text |
| **Dashboard** | Welcome Message | Text |
| | Quick Links Labels | Text |
| **All Pages** | Footer Copyright Text | Text |
| | Privacy Policy Link | Text |
| | Terms of Use Link | Text |

### User Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│  ADMIN WORKFLOW                                                       │
│                                                                       │
│  1. Admin logs into Admin Portal                                      │
│  2. Navigates to Settings > Branding                                  │
│  3. Uploads new logo or changes text                                  │
│  4. Clicks "Preview" to see changes                                   │
│  5. Clicks "Publish" to make changes live                             │
│  6. All Staff Portal pages immediately reflect updates                │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Admin Interface Design

### 2.1 Settings Page Layout

Create `admin/settings.html`:

```html
<!-- Branding Settings Section -->
<section class="settings-section">
    <h3>🎨 Branding & Appearance</h3>
    
    <div class="setting-group">
        <label>Organization Logo</label>
        <div class="logo-upload">
            <img id="currentLogo" src="../assets/images/logo.png" alt="Current Logo">
            <div class="upload-actions">
                <input type="file" id="logoUpload" accept="image/png,image/jpeg,image/svg+xml" hidden>
                <button class="btn btn-secondary" onclick="document.getElementById('logoUpload').click()">
                    📤 Upload New Logo
                </button>
                <small>Recommended: 200x200px, PNG or SVG</small>
            </div>
        </div>
    </div>

    <div class="setting-group">
        <label>Portal Name</label>
        <input type="text" id="portalName" class="form-control" 
               value="Global Staff Portal" placeholder="Enter portal name">
    </div>

    <div class="setting-group">
        <label>Primary Brand Color</label>
        <div class="color-picker-group">
            <input type="color" id="primaryColor" value="#0066CC">
            <input type="text" id="primaryColorHex" class="form-control" value="#0066CC">
        </div>
    </div>
</section>

<!-- Login Page Settings -->
<section class="settings-section">
    <h3>🔐 Login Page</h3>
    
    <div class="setting-group">
        <label>Background Image</label>
        <div class="image-upload">
            <img id="currentLoginBg" src="../assets/images/login-bg.png" alt="Login Background">
            <button class="btn btn-secondary">📤 Upload Background</button>
        </div>
    </div>

    <div class="setting-group">
        <label>Login Subtitle</label>
        <input type="text" id="loginSubtitle" class="form-control" 
               value="Secure Access System">
    </div>

    <div class="setting-group">
        <label>Support Email</label>
        <input type="email" id="supportEmail" class="form-control" 
               value="support@organization.org">
    </div>
</section>

<!-- Footer Settings -->
<section class="settings-section">
    <h3>📄 Footer Content</h3>
    
    <div class="setting-group">
        <label>Copyright Text</label>
        <input type="text" id="copyrightText" class="form-control" 
               value="© 2025 Global Organization. All rights reserved.">
    </div>
</section>

<!-- Action Buttons -->
<div class="settings-actions">
    <button class="btn btn-secondary" onclick="previewChanges()">👁️ Preview</button>
    <button class="btn btn-primary" onclick="saveSettings()">💾 Save Changes</button>
</div>
```

### 2.2 Settings Page CSS

```css
.settings-section {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-sm);
}

.settings-section h3 {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--gray-200);
}

.setting-group {
    margin-bottom: var(--spacing-xl);
}

.setting-group label {
    display: block;
    font-weight: 600;
    color: var(--gray-700);
    margin-bottom: var(--spacing-sm);
}

.logo-upload, .image-upload {
    display: flex;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
    border: 2px dashed var(--gray-300);
    border-radius: var(--radius-md);
}

.logo-upload img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    border-radius: var(--radius-md);
    background: var(--gray-100);
}

.image-upload img {
    width: 200px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--radius-md);
}

.color-picker-group {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
}

.color-picker-group input[type="color"] {
    width: 60px;
    height: 40px;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
}

.settings-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    margin-top: var(--spacing-xl);
}
```

---

## 3. Backend Implementation

### 3.1 CMS Module Structure

```
src/modules/cms/
├── cms.controller.ts    # HTTP handlers
├── cms.service.ts       # Business logic
├── cms.routes.ts        # Route definitions
├── cms.types.ts         # TypeScript interfaces
└── cms.validation.ts    # Input validation schemas
```

### 3.2 Database Migration

```sql
-- migrations/001_create_cms_settings.sql

CREATE TABLE IF NOT EXISTS cms_settings (
    id            SERIAL PRIMARY KEY,
    setting_key   VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type  VARCHAR(20) NOT NULL CHECK (setting_type IN ('text', 'image_url', 'color', 'boolean', 'json')),
    category      VARCHAR(50) NOT NULL,
    description   TEXT,
    is_public     BOOLEAN DEFAULT true,
    updated_by    UUID REFERENCES users(id),
    updated_at    TIMESTAMP DEFAULT NOW(),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Index for fast category lookups
CREATE INDEX idx_cms_settings_category ON cms_settings(category);
CREATE INDEX idx_cms_settings_public ON cms_settings(is_public) WHERE is_public = true;

-- Seed default settings
INSERT INTO cms_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- Branding
('org_logo_url', '/assets/images/logo.png', 'image_url', 'branding', 'Main organization logo', true),
('org_logo_light_url', '/assets/images/logo.png', 'image_url', 'branding', 'Logo for dark backgrounds', true),
('portal_name', 'Global Staff Portal', 'text', 'branding', 'Portal title displayed in header', true),
('primary_color', '#0066CC', 'color', 'branding', 'Primary brand color', true),
('secondary_color', '#004C99', 'color', 'branding', 'Secondary/dark brand color', true),

-- Login
('login_bg_url', '/assets/images/login-bg.png', 'image_url', 'login', 'Login page background image', true),
('login_subtitle', 'Secure Access System', 'text', 'login', 'Subtitle shown on login page', true),
('support_email', 'support@organization.org', 'text', 'login', 'IT support contact email', true),

-- Dashboard
('dashboard_welcome', 'Welcome back, {name}', 'text', 'dashboard', 'Dashboard welcome message template', true),

-- Footer
('copyright_text', '© 2025 Global Organization. All rights reserved.', 'text', 'footer', 'Footer copyright notice', true),
('privacy_policy_url', '/privacy.html', 'text', 'footer', 'Privacy policy page URL', true),
('terms_url', '/terms.html', 'text', 'footer', 'Terms of use page URL', true)

ON CONFLICT (setting_key) DO NOTHING;
```

### 3.3 CMS Service (TypeScript)

```typescript
// src/modules/cms/cms.service.ts

import { prisma } from '../../config/database';
import { uploadFile, deleteFile } from '../../shared/utils/storage';
import { CMSSetting, UpdateSettingDTO } from './cms.types';

export class CMSService {
    
    /**
     * Get all public settings (for frontend consumption)
     */
    async getPublicSettings(): Promise<Record<string, string>> {
        const settings = await prisma.cmsSettings.findMany({
            where: { is_public: true },
            select: { setting_key: true, setting_value: true }
        });
        
        return settings.reduce((acc, s) => {
            acc[s.setting_key] = s.setting_value;
            return acc;
        }, {} as Record<string, string>);
    }

    /**
     * Get settings by category
     */
    async getSettingsByCategory(category: string): Promise<CMSSetting[]> {
        return prisma.cmsSettings.findMany({
            where: { category },
            orderBy: { setting_key: 'asc' }
        });
    }

    /**
     * Get all settings (admin view with metadata)
     */
    async getAllSettings(): Promise<CMSSetting[]> {
        return prisma.cmsSettings.findMany({
            include: {
                updatedByUser: {
                    select: { first_name: true, last_name: true }
                }
            },
            orderBy: [{ category: 'asc' }, { setting_key: 'asc' }]
        });
    }

    /**
     * Update a single setting
     */
    async updateSetting(
        key: string, 
        value: string, 
        adminId: string
    ): Promise<CMSSetting> {
        return prisma.cmsSettings.update({
            where: { setting_key: key },
            data: {
                setting_value: value,
                updated_by: adminId,
                updated_at: new Date()
            }
        });
    }

    /**
     * Bulk update settings
     */
    async bulkUpdateSettings(
        settings: UpdateSettingDTO[], 
        adminId: string
    ): Promise<number> {
        const updatePromises = settings.map(s => 
            prisma.cmsSettings.update({
                where: { setting_key: s.key },
                data: {
                    setting_value: s.value,
                    updated_by: adminId,
                    updated_at: new Date()
                }
            })
        );
        
        const results = await Promise.allSettled(updatePromises);
        return results.filter(r => r.status === 'fulfilled').length;
    }

    /**
     * Upload and update logo
     */
    async uploadLogo(
        file: Express.Multer.File, 
        type: 'main' | 'light',
        adminId: string
    ): Promise<{ url: string }> {
        // Validate file
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Use PNG, JPEG, or SVG.');
        }

        // Upload to storage
        const filename = `logo_${type}_${Date.now()}${this.getExtension(file.mimetype)}`;
        const url = await uploadFile(file.buffer, filename, 'logos');

        // Update setting
        const settingKey = type === 'main' ? 'org_logo_url' : 'org_logo_light_url';
        await this.updateSetting(settingKey, url, adminId);

        return { url };
    }

    /**
     * Upload background image
     */
    async uploadBackground(
        file: Express.Multer.File,
        adminId: string
    ): Promise<{ url: string }> {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Use PNG, JPEG, or WebP.');
        }

        const filename = `login_bg_${Date.now()}${this.getExtension(file.mimetype)}`;
        const url = await uploadFile(file.buffer, filename, 'backgrounds');

        await this.updateSetting('login_bg_url', url, adminId);

        return { url };
    }

    private getExtension(mimeType: string): string {
        const map: Record<string, string> = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/svg+xml': '.svg',
            'image/webp': '.webp'
        };
        return map[mimeType] || '.png';
    }
}

export const cmsService = new CMSService();
```

### 3.4 CMS Controller

```typescript
// src/modules/cms/cms.controller.ts

import { Request, Response, NextFunction } from 'express';
import { cmsService } from './cms.service';

export class CMSController {

    /**
     * GET /api/v1/cms/settings
     * Public endpoint - returns settings for frontend
     */
    async getPublicSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await cmsService.getPublicSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/cms/settings/:category
     * Public endpoint - returns settings by category
     */
    async getSettingsByCategory(req: Request, res: Response, next: NextFunction) {
        try {
            const { category } = req.params;
            const settings = await cmsService.getSettingsByCategory(category);
            
            // Convert to key-value for easier frontend use
            const data = settings.reduce((acc, s) => {
                acc[s.setting_key] = s.setting_value;
                return acc;
            }, {} as Record<string, string>);
            
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/v1/admin/cms/settings
     * Admin only - returns all settings with metadata
     */
    async getAllSettingsAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const settings = await cmsService.getAllSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/admin/cms/settings
     * Admin only - bulk update settings
     */
    async bulkUpdateSettings(req: Request, res: Response, next: NextFunction) {
        try {
            const { settings } = req.body;
            const adminId = req.user!.id;
            
            const updatedCount = await cmsService.bulkUpdateSettings(settings, adminId);
            
            res.json({ 
                success: true, 
                message: `${updatedCount} settings updated successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/v1/admin/cms/settings/:key
     * Admin only - update single setting
     */
    async updateSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            const adminId = req.user!.id;
            
            const setting = await cmsService.updateSetting(key, value, adminId);
            
            res.json({ success: true, data: setting });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/admin/cms/upload/logo
     * Admin only - upload new logo
     */
    async uploadLogo(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: 'No file uploaded' }
                });
            }

            const type = req.body.type === 'light' ? 'light' : 'main';
            const adminId = req.user!.id;
            
            const result = await cmsService.uploadLogo(req.file, type, adminId);
            
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/v1/admin/cms/upload/background
     * Admin only - upload login background
     */
    async uploadBackground(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    success: false, 
                    error: { message: 'No file uploaded' }
                });
            }

            const adminId = req.user!.id;
            const result = await cmsService.uploadBackground(req.file, adminId);
            
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }
}

export const cmsController = new CMSController();
```

### 3.5 CMS Routes

```typescript
// src/modules/cms/cms.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { cmsController } from './cms.controller';
import { authMiddleware, adminOnly } from '../../shared/middleware/auth.middleware';

const router = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public routes (no auth required)
router.get('/settings', cmsController.getPublicSettings);
router.get('/settings/:category', cmsController.getSettingsByCategory);

// Admin routes (require admin role)
router.get('/admin/settings', authMiddleware, adminOnly, cmsController.getAllSettingsAdmin);
router.put('/admin/settings', authMiddleware, adminOnly, cmsController.bulkUpdateSettings);
router.put('/admin/settings/:key', authMiddleware, adminOnly, cmsController.updateSetting);
router.post('/admin/upload/logo', authMiddleware, adminOnly, upload.single('logo'), cmsController.uploadLogo);
router.post('/admin/upload/background', authMiddleware, adminOnly, upload.single('background'), cmsController.uploadBackground);

export default router;
```

---

## 4. Frontend Integration

### 4.1 CMS Client Module

Create `js/cms.js`:

```javascript
/**
 * CMS Client Module
 * Fetches and applies dynamic content from the backend
 */
const CMS = {
    settings: {},
    loaded: false,

    /**
     * Initialize CMS - call on every page load
     */
    async init() {
        try {
            const response = await fetch('/api/v1/cms/settings');
            if (!response.ok) throw new Error('Failed to load CMS settings');
            
            const data = await response.json();
            this.settings = data.data;
            this.loaded = true;
            this.apply();
            
            console.log('✅ CMS settings loaded');
        } catch (error) {
            console.warn('⚠️ CMS settings not available, using defaults:', error.message);
            this.applyDefaults();
        }
    },

    /**
     * Apply CMS settings to the page
     */
    apply() {
        // Apply images
        this.applyImages();
        
        // Apply text content
        this.applyText();
        
        // Apply colors
        this.applyColors();
    },

    /**
     * Apply image settings (logos, backgrounds)
     */
    applyImages() {
        // Organization logo
        if (this.settings.org_logo_url) {
            document.querySelectorAll('[data-cms="org_logo"]').forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = this.settings.org_logo_url;
                }
            });
        }

        // Light logo (for headers with dark background)
        if (this.settings.org_logo_light_url) {
            document.querySelectorAll('[data-cms="org_logo_light"]').forEach(el => {
                if (el.tagName === 'IMG') {
                    el.src = this.settings.org_logo_light_url;
                }
            });
        }

        // Login background
        if (this.settings.login_bg_url) {
            const loginPanel = document.querySelector('.login-left-panel');
            if (loginPanel) {
                loginPanel.style.backgroundImage = `url('${this.settings.login_bg_url}')`;
            }
        }
    },

    /**
     * Apply text content settings
     */
    applyText() {
        const textMappings = {
            'portal_name': this.settings.portal_name,
            'login_subtitle': this.settings.login_subtitle,
            'copyright_text': this.settings.copyright_text,
            'support_email': this.settings.support_email
        };

        Object.entries(textMappings).forEach(([key, value]) => {
            if (value) {
                document.querySelectorAll(`[data-cms="${key}"]`).forEach(el => {
                    if (el.tagName === 'A' && key === 'support_email') {
                        el.href = `mailto:${value}`;
                        el.textContent = value;
                    } else {
                        el.textContent = value;
                    }
                });
            }
        });

        // Handle dynamic welcome message
        if (this.settings.dashboard_welcome) {
            const staffName = sessionStorage.getItem('staffName') || 'User';
            const welcomeMsg = this.settings.dashboard_welcome.replace('{name}', staffName);
            document.querySelectorAll('[data-cms="dashboard_welcome"]').forEach(el => {
                el.textContent = welcomeMsg;
            });
        }
    },

    /**
     * Apply color settings via CSS custom properties
     */
    applyColors() {
        if (this.settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', this.settings.primary_color);
            // Generate darker shade for hover states
            document.documentElement.style.setProperty('--primary-dark', this.darkenColor(this.settings.primary_color, 20));
            document.documentElement.style.setProperty('--primary-light', this.lightenColor(this.settings.primary_color, 20));
        }

        if (this.settings.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', this.settings.secondary_color);
        }
    },

    /**
     * Apply default values (fallback)
     */
    applyDefaults() {
        this.settings = {
            portal_name: 'Global Staff Portal',
            login_subtitle: 'Secure Access System',
            copyright_text: '© 2025 Global Organization. All rights reserved.',
            org_logo_url: 'assets/images/logo.png',
            login_bg_url: 'assets/images/login-bg.png',
            primary_color: '#0066CC'
        };
        this.apply();
    },

    /**
     * Get a specific setting value
     */
    get(key, defaultValue = '') {
        return this.settings[key] || defaultValue;
    },

    /**
     * Utility: Darken a hex color
     */
    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    },

    /**
     * Utility: Lighten a hex color
     */
    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => CMS.init());
```

### 4.2 Update HTML Files

Add `data-cms` attributes to make elements dynamically updatable:

**index.html (Login Page):**

```html
<!-- Logo -->
<img data-cms="org_logo" src="assets/images/logo.png" alt="Organization Logo">

<!-- Portal Name -->
<h1 data-cms="portal_name">Global Staff Portal</h1>

<!-- Subtitle -->
<p class="subtitle" data-cms="login_subtitle">Secure Access System</p>

<!-- Support Email -->
<a data-cms="support_email" href="mailto:support@organization.org">IT Support</a>
```

**dashboard.html & other pages:**

```html
<!-- Header Logo -->
<img data-cms="org_logo_light" src="assets/images/logo.png" alt="Logo">

<!-- Portal Title -->
<h1 class="portal-title" data-cms="portal_name">Global Staff Portal</h1>

<!-- Welcome Message -->
<h2 data-cms="dashboard_welcome">Welcome back, John</h2>

<!-- Footer -->
<p data-cms="copyright_text">© 2025 Global Organization. All rights reserved.</p>
```

### 4.3 Include CMS Script

Add to all HTML pages before closing `</body>`:

```html
<script src="js/cms.js"></script>
```

---

## 5. Step-by-Step Implementation

### Step 1: Database Setup

```bash
# Run migration
npx prisma migrate dev --name add_cms_settings
```

### Step 2: Backend API

1. Create CMS module files (`service`, `controller`, `routes`)
2. Register routes in main app
3. Test endpoints with Postman/curl

### Step 3: Admin Interface

1. Create `admin/settings.html`
2. Add styling and JavaScript
3. Implement API calls for save/upload

### Step 4: Frontend Integration

1. Create `js/cms.js`
2. Add `data-cms` attributes to all HTML files
3. Test by changing values via admin panel

### Step 5: Testing

```bash
# Test public endpoint
curl http://localhost:3000/api/v1/cms/settings

# Test admin update (with auth token)
curl -X PUT http://localhost:3000/api/v1/admin/cms/settings/portal_name \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "New Portal Name"}'
```

---

## 6. Security Considerations

### 6.1 File Upload Security

- ✅ Validate MIME types (PNG, JPEG, SVG only)
- ✅ Limit file size (5MB max)
- ✅ Scan for malware (optional: ClamAV integration)
- ✅ Store outside web root or use signed URLs
- ✅ Rename files to prevent path traversal

### 6.2 Access Control

- ✅ Public read for settings display
- ✅ Admin-only write access
- ✅ Audit log all changes (who, what, when)

### 6.3 Input Validation

- ✅ Sanitize text inputs (prevent XSS)
- ✅ Validate color format (hex only)
- ✅ Validate URLs for external links

---

## 📋 Checklist

- [ ] Database migration created and run
- [ ] CMS service implemented
- [ ] CMS controller implemented
- [ ] Routes registered
- [ ] Admin settings page created
- [ ] Frontend CMS.js module created
- [ ] All HTML files updated with `data-cms` attributes
- [ ] File upload tested
- [ ] Security measures verified
- [ ] Documentation complete

---

**Last Updated**: January 2026
