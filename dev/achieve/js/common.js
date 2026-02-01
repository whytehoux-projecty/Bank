// Common Utilities

// Format dates
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function upgradeToEnhancedLayout() {
    if (document.querySelector('.gac-header-top')) return;

    const oldHeader = document.querySelector('header.main-header');
    if (oldHeader) oldHeader.remove();

    const oldTabs = document.querySelector('nav.nav-tabs');
    if (oldTabs) oldTabs.remove();

    const header = document.createElement('header');
    header.innerHTML = `
        <div class="gac-header-top">
            <a href="dashboard.html" class="gac-logo">
                <img src="assets/logo.svg" alt="UHI Staff Portal" />
                UHI STAFF PORTAL
            </a>

            <div class="gac-search-container">
                <span class="gac-search-icon">🔍</span>
                <input type="text" class="gac-search-input" placeholder="Search" />
            </div>

            <div class="gac-header-actions">
                <span>English</span>
                <div class="user-menu">
                    <button class="user-btn" onclick="toggleUserMenu()" aria-label="User menu">
                        <div class="avatar" id="headerAvatar"></div>
                        <span id="headerName">Loading...</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 8L2 4h8L6 8z" />
                        </svg>
                    </button>
                    <div class="dropdown-menu" id="userDropdown">
                        <a href="account.html">Account</a>
                        <hr />
                        <a href="#" onclick="logout()">Logout</a>
                    </div>
                </div>
            </div>
        </div>

        <div class="gac-subheader">
            <a href="dashboard.html" class="gac-nav-link">Dashboard</a>
            <a href="my-contract.html" class="gac-nav-link">My Contract</a>
            <a href="payments.html" class="gac-nav-link">Payslips &amp; Payments</a>
            <a href="requests.html" class="gac-nav-link">Requests</a>
            <a href="notifications.html" class="gac-nav-link">Notifications</a>
            <a href="account.html" class="gac-nav-link">Account</a>
        </div>
    `;

    document.body.insertAdjacentElement('afterbegin', header);

    const welcomeBar = document.createElement('div');
    welcomeBar.className = 'gac-welcome-bar';
    welcomeBar.innerHTML = `
        <div class="welcome-flex">
            <div>Welcome, <span id="welcomeMsg">User</span></div>
            <div class="inbox-container">
                <button class="notification-btn" onclick="toggleInbox()" title="Notifications">
                    <img
                        id="bellIcon"
                        class="notification-icon"
                        src="assets/notification_bell.svg/icons8-notification-50.svg"
                        alt="Notifications" />
                    <span class="notification-badge-dot" id="inboxBadge" style="display:none"></span>
                </button>

                <div class="inbox-dropdown" id="inboxDropdown">
                    <div class="inbox-header">
                        <span>Notifications</span>
                        <span style="font-size:0.8rem; cursor:pointer" onclick="markAllRead()">Mark all read</span>
                    </div>

                    <div class="inbox-tabs">
                        <div class="inbox-tab active" onclick="switchInboxTab('all')">All</div>
                        <div class="inbox-tab" onclick="switchInboxTab('unread')">Unread</div>
                    </div>

                    <div class="inbox-list" id="inboxList"></div>

                    <div class="msg-detail-view" id="msgDetail">
                        <div class="btn-back" onclick="closeMsgDetail()">← Back to inbox</div>
                        <div class="msg-detail-header">
                            <div class="msg-detail-subject" id="detailSubject">Subject</div>
                            <div class="msg-detail-sender">From: <span id="detailSender">Admin</span></div>
                        </div>
                        <div class="msg-detail-body" id="detailBody"></div>
                        <div class="msg-controls">
                            <button class="btn-msg btn-delete" onclick="deleteMsg()">Delete</button>
                            <button class="btn-msg btn-reply" onclick="replyMsg()">Reply</button>
                        </div>
                    </div>

                    <div class="inbox-footer" id="inboxFooter">
                        <a href="notifications.html">View all notifications</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    header.insertAdjacentElement('afterend', welcomeBar);

    const currentFile = (window.location.pathname.split('/').pop() || '').toLowerCase();
    const activeHref = currentFile || 'dashboard.html';
    header.querySelectorAll('.gac-nav-link').forEach((a) => {
        const href = (a.getAttribute('href') || '').toLowerCase();
        if (href && href === activeHref) a.classList.add('active');
    });

    const main = document.querySelector('main');
    if (main) {
        main.classList.add('gac-main-container');
        main.classList.remove('main-content');
    }

    if (typeof window.initInboxUI === 'function') {
        window.initInboxUI();
    }
}

window.toggleUserMenu ??= function toggleUserMenu() {
    document.getElementById('userDropdown')?.classList.toggle('show');
};

// Global Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const isLanding = path.endsWith('/') || path.endsWith('/index.html') || path.endsWith('index.html');
    const isLogin = path.endsWith('login.html');
    const isReset = path.endsWith('reset-password.html');
    const isAdmin = path.includes('/admin/');
    const isPublic = isLanding || isLogin || isReset || isAdmin;

    if (!isPublic) {
        upgradeToEnhancedLayout();
    }

    const apply = (user) => {
        if (!user) return;
        applyUserToUI(user);
        if (typeof window.initInboxUI === 'function') {
            window.initInboxUI();
        }
    };

    if (!isPublic && window.Auth) {
        Auth.checkAuth().then(apply);
    } else if (window.Auth && Auth.isAuthenticated()) {
        apply(Auth.getCachedUser());
    }

    // Update current date display if element exists
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (window.CMS && typeof CMS.init === 'function') {
        CMS.init();
    }
});

function initialsFromName(firstName, lastName, fallback) {
    const a = (firstName || '').trim();
    const b = (lastName || '').trim();
    const initial = (s) => (s ? s[0].toUpperCase() : '');
    const res = `${initial(a)}${initial(b)}`.trim();
    return res || fallback || 'U';
}

function applyUserToUI(user) {
    const firstName = user.firstName || user.first_name || '';
    const lastName = user.lastName || user.last_name || '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || user.name || 'User';
    const avatarText = initialsFromName(firstName, lastName, fullName);

    const normalizeTitle = (rawTitle) => {
        const t = String(rawTitle || '').trim();
        if (!t) return '';
        const key = t.toLowerCase().replace(/\./g, '');
        const map = {
            doctor: 'Dr',
            dr: 'Dr',
            professor: 'Prof',
            prof: 'Prof',
            mister: 'Mr',
            mr: 'Mr',
            miss: 'Ms',
            ms: 'Ms',
            mrs: 'Mrs',
        };
        return map[key] || t;
    };

    const rawTitle =
        user.title ||
        user.honorific ||
        user.prefix ||
        '';
    const title = normalizeTitle(rawTitle);
    const welcomeName = `${title ? `${title} ` : ''}${firstName || fullName}`.trim();

    document.querySelectorAll('.user-btn span').forEach(el => {
        if (fullName) el.textContent = fullName;
    });
    document.querySelectorAll('.avatar').forEach(el => {
        if (avatarText) el.textContent = avatarText;
    });

    const headerName = document.getElementById('headerName');
    if (headerName) headerName.textContent = fullName;

    const welcomeMsg = document.getElementById('welcomeMsg');
    if (welcomeMsg) welcomeMsg.textContent = welcomeName || 'User';
}

window.initInboxUI ??= function initInboxUI() {
    const bellIcon = document.getElementById('bellIcon');
    const inboxBadge = document.getElementById('inboxBadge');
    const inboxDropdown = document.getElementById('inboxDropdown');
    const inboxList = document.getElementById('inboxList');
    const msgDetail = document.getElementById('msgDetail');
    const inboxFooter = document.getElementById('inboxFooter');

    if (!bellIcon || !inboxBadge || !inboxDropdown || !inboxList) return;

    if (!Array.isArray(window.__PORTAL_INBOX_MSGS)) {
        window.__PORTAL_INBOX_MSGS = [
            {
                id: 1,
                sender: 'Admin',
                subject: 'Policy Update: R&R Leave',
                body: 'Please review the new R&R policy updates effective immediately.',
                read: false,
                date: '10 min ago',
            },
            {
                id: 2,
                sender: 'HR Dept',
                subject: 'Document Missing',
                body: 'We are missing your signed contract for 2026. Please upload it.',
                read: false,
                date: '1 hr ago',
            },
            {
                id: 3,
                sender: 'System',
                subject: 'Password Changed',
                body: 'Your password was successfully changed yesterday.',
                read: true,
                date: '1 day ago',
            },
        ];
    }

    window.__PORTAL_INBOX_CURRENT ??= [...window.__PORTAL_INBOX_MSGS];
    window.__PORTAL_INBOX_ACTIVE_ID ??= null;

    const renderInbox = () => {
        const msgs = window.__PORTAL_INBOX_CURRENT || [];
        inboxList.innerHTML = '';

        const unreadCount = (window.__PORTAL_INBOX_MSGS || []).filter((m) => !m.read).length;
        if (unreadCount > 0) {
            inboxBadge.style.display = 'block';
            bellIcon.classList.add('is-unread');
        } else {
            inboxBadge.style.display = 'none';
            bellIcon.classList.remove('is-unread');
        }

        if (msgs.length === 0) {
            inboxList.innerHTML =
                '<div style="padding:20px; text-align:center; color:#999; font-size:0.9rem;">No messages</div>';
            return;
        }

        msgs.forEach((msg) => {
            const item = document.createElement('div');
            item.className = `msg-item ${msg.read ? '' : 'unread'}`;
            item.onclick = () => window.openMsg(msg.id);
            item.innerHTML = `
                <div class="msg-avatar">${String(msg.sender || 'U')[0]}</div>
                <div class="msg-content-preview">
                   <div class="msg-subject">${msg.subject || ''}</div>
                   <div class="msg-preview">${msg.body || ''}</div>
                   <div class="msg-meta">
                      <span class="msg-date">${msg.date || ''}</span>
                   </div>
                </div>
            `;
            inboxList.appendChild(item);
        });
    };

    window.renderInbox ??= renderInbox;

    window.toggleInbox ??= function toggleInbox() {
        inboxDropdown.classList.toggle('show');
        if (inboxDropdown.classList.contains('show')) {
            window.renderInbox();
        }
    };

    window.switchInboxTab ??= function switchInboxTab(tab) {
        document.querySelectorAll('.inbox-tab').forEach((el) => el.classList.remove('active'));
        if (typeof event !== 'undefined' && event?.target) {
            event.target.classList.add('active');
        }
        if (tab === 'unread') {
            window.__PORTAL_INBOX_CURRENT = (window.__PORTAL_INBOX_MSGS || []).filter((m) => !m.read);
        } else {
            window.__PORTAL_INBOX_CURRENT = [...(window.__PORTAL_INBOX_MSGS || [])];
        }
        window.renderInbox();
    };

    window.openMsg ??= function openMsg(id) {
        window.__PORTAL_INBOX_ACTIVE_ID = id;
        const msg = (window.__PORTAL_INBOX_MSGS || []).find((m) => m.id === id);
        if (!msg) return;
        msg.read = true;
        window.__PORTAL_INBOX_CURRENT = [...(window.__PORTAL_INBOX_CURRENT || [])];
        window.renderInbox();

        if (!msgDetail) return;
        const detailSubject = document.getElementById('detailSubject');
        const detailSender = document.getElementById('detailSender');
        const detailBody = document.getElementById('detailBody');
        if (detailSubject) detailSubject.textContent = msg.subject || '';
        if (detailSender) detailSender.textContent = msg.sender || '';
        if (detailBody) detailBody.textContent = msg.body || '';

        inboxList.style.display = 'none';
        if (inboxFooter) inboxFooter.style.display = 'none';
        msgDetail.style.display = 'block';
    };

    window.closeMsgDetail ??= function closeMsgDetail() {
        window.__PORTAL_INBOX_ACTIVE_ID = null;
        if (!msgDetail) return;
        msgDetail.style.display = 'none';
        inboxList.style.display = 'block';
        if (inboxFooter) inboxFooter.style.display = 'block';
        window.renderInbox();
    };

    window.markAllRead ??= function markAllRead() {
        (window.__PORTAL_INBOX_MSGS || []).forEach((m) => (m.read = true));
        window.__PORTAL_INBOX_CURRENT = [...(window.__PORTAL_INBOX_MSGS || [])];
        window.renderInbox();
    };

    window.deleteMsg ??= function deleteMsg() {
        const activeId = window.__PORTAL_INBOX_ACTIVE_ID;
        if (!activeId) return;
        window.__PORTAL_INBOX_MSGS = (window.__PORTAL_INBOX_MSGS || []).filter((m) => m.id !== activeId);
        window.__PORTAL_INBOX_CURRENT = [...(window.__PORTAL_INBOX_MSGS || [])];
        window.closeMsgDetail();
        alert('Message deleted');
    };

    window.replyMsg ??= function replyMsg() {
        alert('Reply feature would match email client behavior.');
    };

    document.addEventListener('click', (e) => {
        const container = document.querySelector('.inbox-container');
        if (container && !container.contains(e.target)) {
            inboxDropdown.classList.remove('show');
        }
    });

    window.renderInbox();
};

// Logout helper
function logout() {
    if (window.Auth) {
        Auth.logout();
    } else {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}
