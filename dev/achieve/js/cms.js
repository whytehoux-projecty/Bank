/**
 * CMS Client Module
 * Fetches and applies dynamic content from the backend
 */
const CMS = {
    settings: {},
    loaded: false,
    apiUrl: null,
    apiOrigin: null,

    getOrigin() {
        if (typeof this.apiOrigin === 'string' && this.apiOrigin.length > 0) {
            return this.apiOrigin;
        }
        if (window.API && typeof API.request === 'function') {
            return window.location.port === '3000' ? window.location.origin : 'http://localhost:3000';
        }
        return 'http://localhost:3000';
    },

    /**
     * Initialize CMS - call on every page load
     */
    async init() {
        try {
            if (window.API && typeof API.request === 'function') {
                const res = await API.request('/cms/settings');
                this.settings = res?.data || {};
            } else {
                const apiUrl = this.apiUrl || `${this.getOrigin()}/api/v1`;
                const response = await fetch(`${apiUrl}/cms/settings`);
                if (!response.ok) throw new Error('Failed to load CMS settings');
                const data = await response.json();
                this.settings = data.data || {};
            }
            this.loaded = true;
            this.apply();
        } catch (error) {
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
                    // Prepend API URL if it's a relative path from backend
                    const src = this.settings.org_logo_url.startsWith('http')
                        ? this.settings.org_logo_url
                        : `${this.getOrigin()}${this.settings.org_logo_url}`;
                    el.src = src;
                }
            });
        }

        // Light logo (for headers with dark background)
        if (this.settings.org_logo_light_url) {
            document.querySelectorAll('[data-cms="org_logo_light"]').forEach(el => {
                if (el.tagName === 'IMG') {
                    const src = this.settings.org_logo_light_url.startsWith('http')
                        ? this.settings.org_logo_light_url
                        : `${this.getOrigin()}${this.settings.org_logo_light_url}`;
                    el.src = src;
                }
            });
        }

        // Login background
        if (this.settings.login_bg_url) {
            const loginPanel = document.querySelector('.login-left-panel');
            if (loginPanel) {
                const src = this.settings.login_bg_url.startsWith('http')
                    ? this.settings.login_bg_url
                    : `${this.getOrigin()}${this.settings.login_bg_url}`;
                loginPanel.style.backgroundImage = `url('${src}')`;
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
            let staffName = 'User';
            try {
                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                staffName =
                    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
                    user.name ||
                    staffName;
            } catch {
                staffName = 'User';
            }
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
            org_logo_url: '/assets/logo.svg',
            login_bg_url: 'assets/images/login-bg.png',
            primary_color: '#5A4336'
        };
        // this.apply(); // Don't apply defaults if they override static HTML content badly, 
        // but here static HTML has defaults. 
        // Actually, let's not override if fetch fails, just keep static HTML.
        // But if we want consistent JS behavior we might. 
        // I'll leave it disabled to respect static content if backend is down.
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
