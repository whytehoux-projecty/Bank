# MY ACCOUNTS PAGE OPTIMIZATION PLAN

## JP Heritage E-Banking Portal

**Current State Analysis Date**: February 24, 2026  
**Optimization Type**: Complete Feature Implementation (NO Style Refactoring)  
**Priority**: CRITICAL - Page is Non-Functional

---

## 🚨 CRITICAL ISSUES

### Issue #1: Data Loading Failure

**Problem**: Page shows "$0.00" and "0 Active Accounts" with "3 errors"  
**Impact**: Users cannot see any account information  
**Root Cause**: API errors or connection failure  
**Priority**: IMMEDIATE FIX REQUIRED

### Issue #2: Empty Page Content

**Problem**: No account cards or information displayed  
**Impact**: Page is completely non-functional  
**Priority**: CRITICAL

### Issue #3: Missing Core Features

**Problem**: Page lacks ALL essential account management features  
**Impact**: Cannot perform any account operations  
**Priority**: HIGH

---

## 📊 CURRENT STATE vs. WORLD-CLASS STANDARD

### What You Have ✅

1. Page header with title
2. Total liquid assets banner (not working)
3. Nice navy banner with bank icon illustration

### What's Missing 🚨

#### **Tier 1: Critical Missing Features**

1. ❌ Account cards display
2. ❌ Individual account balances
3. ❌ Account details view
4. ❌ Recent transactions per account
5. ❌ Quick actions (transfer, pay, view statements)

#### **Tier 2: Essential Features**

6. ❌ Account filters/sorting
2. ❌ Account search
3. ❌ Account nicknames
4. ❌ Account performance charts
5. ❌ Interest earned tracking

#### **Tier 3: Advanced Features**

11. ❌ Link external accounts
2. ❌ Open new accounts
3. ❌ Close/freeze accounts
4. ❌ Account alerts/notifications
5. ❌ Download statements
6. ❌ Account settings
7. ❌ Account sharing (joint accounts)
8. ❌ Sub-accounts/savings goals
9. ❌ Account comparison view
10. ❌ Account activity insights

---

## 🎯 COMPREHENSIVE OPTIMIZATION PLAN

### PHASE 1: Fix Data Loading & Display Accounts (Week 1-2)

#### 1.1 Fix Critical API Error

**Priority**: IMMEDIATE

**Current Code (Broken)**:

```javascript
// FILE: pages/accounts/index.jsx (current broken state)

const [accounts, setAccounts] = useState([]);
const [totalAssets, setTotalAssets] = useState(0);

useEffect(() => {
  fetchAccounts(); // Failing with 3 errors
}, []);

const fetchAccounts = async () => {
  const response = await fetch('/api/accounts'); // No error handling
  const data = await response.json();
  setAccounts(data);
};
```

**Fixed Implementation**:

```javascript
// FILE: pages/accounts/index.jsx (fixed)

import React, { useState, useEffect } from 'react';
import AccountCard from '@/components/accounts/AccountCard';
import AccountDetailsModal from '@/components/accounts/AccountDetailsModal';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalAssets, setTotalAssets] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'checking', 'savings', 'credit', 'investment'
  const [sortBy, setSortBy] = useState('balance-desc'); // 'balance-desc', 'balance-asc', 'name', 'recent'
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load accounts`);
      }

      const data = await response.json();
      
      setAccounts(data.accounts || []);
      
      // Calculate total liquid assets
      const total = (data.accounts || []).reduce((sum, account) => {
        // Only count liquid accounts (checking, savings)
        if (account.type === 'checking' || account.type === 'savings') {
          return sum + (account.availableBalance || 0);
        }
        return sum;
      }, 0);
      
      setTotalAssets(total);

    } catch (err) {
      console.error('Failed to fetch accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort accounts
  const filteredAccounts = accounts
    .filter(account => {
      if (filter === 'all') return true;
      return account.type === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'balance-desc':
          return (b.availableBalance || 0) - (a.availableBalance || 0);
        case 'balance-asc':
          return (a.availableBalance || 0) - (b.availableBalance || 0);
        case 'name':
          return (a.nickname || a.name).localeCompare(b.nickname || b.name);
        case 'recent':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        default:
          return 0;
      }
    });

  const activeAccountCount = accounts.filter(a => a.status === 'active').length;

  return (
    <div className="accounts-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">My Accounts</h1>
          <p className="page-subtitle">Manage and view details of all your accounts</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => loadAccounts()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
          <button className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 4v16m8-8H4"/>
            </svg>
            Open New Account
          </button>
        </div>
      </div>

      {/* Total Assets Banner */}
      <div className="total-assets-banner">
        <div className="banner-content">
          <div className="assets-info">
            <h3 className="assets-label">Total Liquid Assets</h3>
            {loading ? (
              <div className="assets-skeleton"></div>
            ) : (
              <div className="assets-amount">${totalAssets.toFixed(2)}</div>
            )}
            <div className="assets-badge">
              {loading ? '...' : `${activeAccountCount} Active Accounts`}
            </div>
          </div>
          <div className="banner-illustration">
            {/* Keep existing bank icon illustration */}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <div className="error-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="error-message">
              <strong>Failed to load accounts</strong>
              <p>{error}</p>
            </div>
          </div>
          <button className="btn btn-secondary btn-small" onClick={loadAccounts}>
            Try Again
          </button>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="accounts-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Accounts ({accounts.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'checking' ? 'active' : ''}`}
            onClick={() => setFilter('checking')}
          >
            Checking ({accounts.filter(a => a.type === 'checking').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'savings' ? 'active' : ''}`}
            onClick={() => setFilter('savings')}
          >
            Savings ({accounts.filter(a => a.type === 'savings').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'credit' ? 'active' : ''}`}
            onClick={() => setFilter('credit')}
          >
            Credit ({accounts.filter(a => a.type === 'credit').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'investment' ? 'active' : ''}`}
            onClick={() => setFilter('investment')}
          >
            Investment ({accounts.filter(a => a.type === 'investment').length})
          </button>
        </div>

        <div className="sort-control">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="balance-desc">Balance (High to Low)</option>
            <option value="balance-asc">Balance (Low to High)</option>
            <option value="name">Account Name</option>
            <option value="recent">Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="accounts-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="account-card skeleton">
              <div className="skeleton-header"></div>
              <div className="skeleton-body"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAccounts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏦</div>
          <h3>No accounts found</h3>
          <p>
            {filter === 'all' 
              ? "You don't have any accounts yet. Open your first account to get started."
              : `You don't have any ${filter} accounts.`}
          </p>
          <button className="btn btn-primary">Open New Account</button>
        </div>
      )}

      {/* Accounts Grid */}
      {!loading && !error && filteredAccounts.length > 0 && (
        <div className="accounts-grid">
          {filteredAccounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              onViewDetails={() => setSelectedAccount(account)}
              onRefresh={loadAccounts}
            />
          ))}
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onRefresh={loadAccounts}
        />
      )}
    </div>
  );
};

export default AccountsPage;
```

#### 1.2 Create Account Card Component

**Component**: `AccountCard.jsx`

```javascript
// FILE: components/accounts/AccountCard.jsx

import React, { useState } from 'react';

const AccountCard = ({ account, onViewDetails, onRefresh }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getAccountIcon = (type) => {
    const icons = {
      checking: '💳',
      savings: '🏦',
      credit: '💰',
      investment: '📈',
      loan: '🏠'
    };
    return icons[type] || '💵';
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      checking: '#3B82F6',
      savings: '#10B981',
      credit: '#F59E0B',
      investment: '#8B5CF6',
      loan: '#EF4444'
    };
    return colors[type] || '#6B7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10B981',
      frozen: '#F59E0B',
      closed: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const formatAccountNumber = (accountNumber) => {
    return `****${accountNumber.slice(-4)}`;
  };

  const calculatePercentage = (current, limit) => {
    if (!limit || limit === 0) return 0;
    return (current / limit) * 100;
  };

  return (
    <div className="account-card">
      {/* Card Header */}
      <div className="account-card-header">
        <div className="account-type-icon" style={{ backgroundColor: `${getAccountTypeColor(account.type)}20` }}>
          <span style={{ color: getAccountTypeColor(account.type) }}>
            {getAccountIcon(account.type)}
          </span>
        </div>
        <div className="account-header-info">
          <h3 className="account-name">{account.nickname || account.name}</h3>
          <p className="account-number">{formatAccountNumber(account.accountNumber)}</p>
        </div>
        <button 
          className="account-menu-btn"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>

        {/* Quick Actions Dropdown */}
        {showQuickActions && (
          <div className="quick-actions-menu">
            <button className="quick-action-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              View Details
            </button>
            <button className="quick-action-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download Statement
            </button>
            <button className="quick-action-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
              Edit Nickname
            </button>
            <button className="quick-action-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Account Settings
            </button>
          </div>
        )}
      </div>

      {/* Card Body - Balance */}
      <div className="account-card-body">
        <div className="balance-section">
          <div className="balance-label">
            {account.type === 'credit' ? 'Available Credit' : 'Available Balance'}
          </div>
          <div className="balance-amount">
            ${(account.availableBalance || 0).toFixed(2)}
          </div>
          
          {/* Show current balance if different */}
          {account.currentBalance !== account.availableBalance && (
            <div className="current-balance">
              Current: ${(account.currentBalance || 0).toFixed(2)}
            </div>
          )}
        </div>

        {/* Credit Card Progress */}
        {account.type === 'credit' && account.creditLimit && (
          <div className="credit-utilization">
            <div className="utilization-header">
              <span>Credit Used</span>
              <span className="utilization-percentage">
                {calculatePercentage(account.currentBalance, account.creditLimit).toFixed(0)}%
              </span>
            </div>
            <div className="utilization-bar">
              <div 
                className="utilization-fill"
                style={{ 
                  width: `${calculatePercentage(account.currentBalance, account.creditLimit)}%`,
                  backgroundColor: calculatePercentage(account.currentBalance, account.creditLimit) > 30 
                    ? '#EF4444' 
                    : '#10B981'
                }}
              ></div>
            </div>
            <div className="utilization-amounts">
              <span>${account.currentBalance.toFixed(2)} used</span>
              <span>${account.creditLimit.toFixed(2)} limit</span>
            </div>
          </div>
        )}

        {/* Interest Rate (for savings/loans) */}
        {account.interestRate && (
          <div className="interest-rate-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
            {account.interestRate}% APY
          </div>
        )}

        {/* Account Status */}
        {account.status !== 'active' && (
          <div 
            className="status-badge"
            style={{ 
              backgroundColor: `${getStatusColor(account.status)}20`,
              color: getStatusColor(account.status)
            }}
          >
            {account.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Card Footer - Quick Actions */}
      <div className="account-card-footer">
        <button 
          className="card-action-btn"
          onClick={onViewDetails}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
          View Details
        </button>

        {account.type !== 'credit' && (
          <button className="card-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
            Transfer
          </button>
        )}

        {account.type === 'credit' && (
          <button className="card-action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Pay
          </button>
        )}

        <button className="card-action-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Statements
        </button>
      </div>

      {/* Recent Activity Preview */}
      {account.recentTransactions && account.recentTransactions.length > 0 && (
        <div className="recent-activity-preview">
          <div className="activity-header">
            <span>Recent Activity</span>
            <button className="view-all-btn">View All →</button>
          </div>
          <div className="activity-list">
            {account.recentTransactions.slice(0, 3).map((tx, idx) => (
              <div key={idx} className="activity-item">
                <div className="activity-merchant">{tx.merchant}</div>
                <div className={`activity-amount ${tx.type === 'credit' ? 'credit' : 'debit'}`}>
                  {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
```

**CSS for Account Card** (matches your existing style):

```css
/* FILE: styles/components/account-card.css */

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  padding: 24px 0;
}

.account-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.account-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* Card Header */
.account-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #F3F4F6;
  position: relative;
}

.account-type-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.account-header-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-family: serif; /* Match existing */
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-number {
  font-family: monospace;
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.account-menu-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #F3F4F6;
  border-radius: 8px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account-menu-btn:hover {
  background: #E5E7EB;
  color: #1F2937;
}

/* Quick Actions Menu */
.quick-actions-menu {
  position: absolute;
  top: 60px;
  right: 20px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 200px;
  overflow: hidden;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: #374151;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.quick-action-item:hover {
  background: #F9FAFB;
}

.quick-action-item:not(:last-child) {
  border-bottom: 1px solid #F3F4F6;
}

/* Card Body */
.account-card-body {
  padding: 24px 20px;
}

.balance-section {
  margin-bottom: 16px;
}

.balance-label {
  font-size: 13px;
  color: #6B7280;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.balance-amount {
  font-family: serif; /* Match your existing */
  font-size: 32px;
  font-weight: 700;
  color: #2C3E5C; /* Navy - your primary color */
  line-height: 1;
}

.current-balance {
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 6px;
}

/* Credit Utilization */
.credit-utilization {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F3F4F6;
}

.utilization-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #6B7280;
}

.utilization-percentage {
  font-weight: 700;
  color: #1F2937;
}

.utilization-bar {
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.utilization-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 4px;
}

.utilization-amounts {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #9CA3AF;
}

/* Badges */
.interest-rate-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #DCFCE7;
  color: #166534;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-top: 12px;
}

/* Card Footer */
.account-card-footer {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
  background: #F9FAFB;
  border-top: 1px solid #F3F4F6;
}

.card-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-action-btn:hover {
  border-color: #D4A574; /* Gold accent - your brand color */
  background: #FFFBF5;
  color: #2C3E5C;
}

/* Recent Activity Preview */
.recent-activity-preview {
  padding: 16px 20px;
  border-top: 1px solid #F3F4F6;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.view-all-btn {
  background: none;
  border: none;
  color: #D4A574; /* Gold */
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 13px;
}

.activity-merchant {
  color: #6B7280;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-amount {
  font-family: monospace;
  font-weight: 600;
  font-size: 14px;
}

.activity-amount.credit {
  color: #10B981;
}

.activity-amount.debit {
  color: #EF4444;
}

/* Loading Skeleton */
.account-card.skeleton {
  pointer-events: none;
}

.skeleton-header,
.skeleton-body,
.skeleton-footer {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

.skeleton-header {
  height: 48px;
  margin: 20px 20px 16px 20px;
}

.skeleton-body {
  height: 120px;
  margin: 0 20px 16px 20px;
}

.skeleton-footer {
  height: 40px;
  margin: 0 20px 20px 20px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

### PHASE 2: Account Details Modal (Week 3)

**Component**: `AccountDetailsModal.jsx`

This will show:

- Full account information
- Transaction history (last 30 days)
- Account settings
- Statements download
- Account actions (freeze, close, etc.)

---

### PHASE 3: Advanced Features (Week 4-8)

#### 3.1 Link External Accounts

#### 3.2 Open New Account Flow

#### 3.3 Account Alerts & Notifications

#### 3.4 Savings Goals / Sub-Accounts

#### 3.5 Account Performance Analytics

---

## 📊 SUCCESS METRICS

**Before:**

- $0.00 displayed
- 0 accounts shown
- 3 errors
- Completely non-functional

**After:**

- All accounts displayed with real balances
- Account filtering by type
- Sort by balance, name, or activity
- Individual account cards with quick actions
- Recent transactions preview
- Credit utilization tracking
- Account details modal
- Statement downloads
- Account management features

---

**This plan will transform your broken page into a world-class account management interface!**
