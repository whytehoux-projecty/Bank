const Auth = {
    getLoginHref() {
        return window.location.pathname.includes('/admin/') ? '../login.html' : 'login.html';
    },

    isAuthenticated() {
        return Boolean(sessionStorage.getItem('accessToken'));
    },

    async login(staffId, password) {
        const res = await API.request('/auth/login', {
            method: 'POST',
            body: { staffId, password }
        });

        const payload = res?.data;
        if (!payload?.accessToken) {
            throw new Error('Login failed');
        }

        API.setTokens({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken
        });

        sessionStorage.setItem('user', JSON.stringify(payload.user || {}));
        return payload.user;
    },

    logout() {
        API.clearTokens();
        window.location.href = this.getLoginHref();
    },

    getCachedUser() {
        try {
            return JSON.parse(sessionStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    },

    async getProfile() {
        const res = await API.request('/staff/profile', { auth: true });
        if (res?.data) {
            const cached = this.getCachedUser();
            const merged = { ...cached, ...res.data };
            sessionStorage.setItem('user', JSON.stringify(merged));
            return merged;
        }
        return this.getCachedUser();
    },

    async checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = this.getLoginHref();
            return null;
        }

        try {
            return await this.getProfile();
        } catch (e) {
            this.logout();
            return null;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const staffId = document.getElementById('staffId').value.trim();
        const password = document.getElementById('password').value;

        try {
            await Auth.login(staffId, password);
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err?.message || 'Login failed');
        }
    });
});
