# CARDS CENTER OPTIMIZATION PLAN
## JP Heritage E-Banking Portal

**Current State Analysis Date**: February 24, 2026  
**Optimization Type**: Feature Enhancement (NO Style Refactoring)  
**Priority**: MEDIUM-HIGH - Good foundation, needs expansion

---

## 📊 CURRENT STATE ASSESSMENT

### What's Working Well ✅

**Excellent Features:**
1. ✅ Beautiful 3D card visualization
2. ✅ Card wallet with multiple cards
3. ✅ Weekly spending chart (great visual)
4. ✅ Recent usage locations with timestamps
5. ✅ Security & permissions controls
6. ✅ Freeze card functionality
7. ✅ Contactless toggle
8. ✅ International transactions toggle
9. ✅ Credit score integration (785 - Excellent)
10. ✅ Three action buttons (Apply, Replace, Attach External)
11. ✅ Show/hide card number feature
12. ✅ Card status indicator (Active)
13. ✅ Contactless payment icon

**Good UI/UX:**
- Clean card design
- Clear information hierarchy
- Good use of white space
- Intuitive toggle switches
- Clear location tracking

---

## 🚨 WHAT'S MISSING - CRITICAL GAPS

### Tier 1: Essential Missing Features (High Priority)

#### 1. **No Transaction History for Selected Card**
**Problem**: Can see locations but not actual transactions  
**Impact**: Users can't see what they spent money on  
**Need**: Full transaction list with merchant, amount, date, category

#### 2. **Missing Card Limits & Controls**
**Problem**: No spending limits visible or configurable  
**Impact**: Can't set daily/monthly limits or per-transaction caps  
**Need**: 
- Daily spending limit
- Monthly spending limit
- ATM withdrawal limit
- Online purchase limit
- Merchant category restrictions

#### 3. **No Virtual Card Generation**
**Problem**: Can't create temporary/disposable card numbers  
**Impact**: Security risk for online shopping  
**Need**: One-time use virtual cards, subscription cards

#### 4. **No Card Statements/Reports**
**Problem**: Can't download monthly statements  
**Impact**: No way to review/export card activity  
**Need**: PDF statements, CSV exports, tax reports

#### 5. **Missing Rewards/Cashback Tracking**
**Problem**: No rewards balance or redemption options  
**Impact**: Users don't know their points/cashback  
**Need**: 
- Rewards balance
- Points history
- Redemption options
- Cashback tracker
- Rewards catalog

#### 6. **No Dispute/Fraud Reporting**
**Problem**: Can't report fraudulent transactions  
**Impact**: No fraud protection workflow  
**Need**: 
- Report fraud button
- Dispute transaction
- Temporary card lock during investigation

#### 7. **Missing Card Insights/Analytics**
**Problem**: Only shows weekly spending, no deeper insights  
**Impact**: Can't understand spending patterns  
**Need**:
- Spending by category (pie chart)
- Merchant frequency
- Monthly trends
- Budget tracking
- Unusual spending alerts

#### 8. **No PIN Management**
**Problem**: Can't change or reset PIN  
**Impact**: Security risk if PIN compromised  
**Need**: Change PIN, View PIN (with auth), Reset PIN

#### 9. **No Card Delivery Tracking**
**Problem**: After requesting new/replacement card, no tracking  
**Impact**: Don't know when card will arrive  
**Need**: 
- Delivery status
- Tracking number
- Estimated delivery date
- Activate new card flow

#### 10. **Missing Alert Preferences**
**Problem**: Can't configure what notifications to receive  
**Impact**: Either too many or too few alerts  
**Need**:
- Transaction amount thresholds
- Suspicious activity alerts
- Balance alerts
- Payment due alerts
- International usage alerts

---

### Tier 2: Important Missing Features (Medium Priority)

#### 11. **No Card Details Modal/Expanded View**
**Problem**: Limited info shown on main view  
**Need**: 
- Full card number (with auth)
- CVV (with auth)
- Billing address
- Card nickname
- Linked account
- Auto-pay settings

#### 12. **Missing Card Benefits Display**
**Problem**: Users don't know card perks  
**Need**: 
- Travel insurance details
- Purchase protection
- Extended warranty
- Lounge access
- Concierge service

#### 13. **No Linked Accounts Display**
**Problem**: Don't know which bank account funds the card  
**Need**: 
- Linked checking account
- Auto-pay source
- Change linked account

#### 14. **No Card Comparison Feature**
**Problem**: When applying for new card, can't compare options  
**Need**: Side-by-side comparison of card benefits

#### 15. **Missing Payment Due Information (for credit cards)**
**Problem**: No indication of upcoming payment  
**Need**:
- Payment due date
- Minimum payment
- Statement balance
- Quick pay button

---

### Tier 3: Advanced Features (Lower Priority but Competitive)

#### 16. **No Card Controls by Merchant Category**
**Problem**: Can't block specific merchant types  
**Need**: Block gambling, adult content, etc.

#### 17. **No Recurring Payment Management**
**Problem**: Can't see subscriptions charged to card  
**Need**: 
- List of recurring charges
- Cancel subscription helper
- Subscription alerts

#### 18. **No Travel Notices**
**Problem**: Card might get blocked during travel  
**Need**: Add travel dates/locations

#### 19. **No Card Sharing (Authorized Users)**
**Problem**: Can't add family members  
**Need**: Add authorized users, set their limits

#### 20. **Missing Apple Pay/Google Pay Integration Status**
**Problem**: Don't know if card is added to mobile wallet  
**Need**: 
- Show if added to Apple/Google Pay
- Quick add button
- Remove from wallet option

---

## 🎯 COMPREHENSIVE OPTIMIZATION PLAN

### PHASE 1: Transaction History & Details (Week 1-2)

#### 1.1 Add Transaction History Section

**Component**: `CardTransactionHistory.jsx`

```javascript
// FILE: components/cards/CardTransactionHistory.jsx

import React, { useState, useEffect } from 'react';

const CardTransactionHistory = ({ cardId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [cardId, filter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/cards/${cardId}/transactions?filter=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card-transactions-section">
      <div className="section-header">
        <h3>Transaction History</h3>
        <div className="transaction-controls">
          {/* Filter Buttons */}
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This Week
            </button>
            <button 
              className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${filter === 'year' ? 'active' : ''}`}
              onClick={() => setFilter('year')}
            >
              This Year
            </button>
          </div>

          {/* Search */}
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Export Button */}
          <button className="btn btn-secondary btn-small">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7l-5-5m0 0L7 8m5-5v12"/>
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="transactions-loading">Loading...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="transactions-empty">
          <p>No transactions found</p>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-left">
                {/* Merchant Icon/Logo */}
                <div className="merchant-icon">
                  {transaction.merchantLogo ? (
                    <img src={transaction.merchantLogo} alt={transaction.merchant} />
                  ) : (
                    <span>{transaction.category === 'Dining' ? '🍽️' : 
                           transaction.category === 'Shopping' ? '🛍️' : 
                           transaction.category === 'Gas' ? '⛽' : '💳'}</span>
                  )}
                </div>

                {/* Transaction Details */}
                <div className="transaction-info">
                  <div className="merchant-name">{transaction.merchant}</div>
                  <div className="transaction-meta">
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="transaction-separator">•</span>
                    <span className="transaction-category">{transaction.category}</span>
                  </div>
                </div>
              </div>

              <div className="transaction-right">
                <div className="transaction-amount">
                  ${transaction.amount.toFixed(2)}
                </div>
                <div className="transaction-status">
                  <span className={`status-badge ${transaction.status}`}>
                    {transaction.status}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <button className="transaction-menu-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardTransactionHistory;
```

**Integration**: Add this below the "Recent Usage Locations" section in your current page.

---

### PHASE 2: Card Limits & Controls (Week 3)

#### 2.1 Spending Limits Section

**Component**: `CardLimitsControl.jsx`

```javascript
// FILE: components/cards/CardLimitsControl.jsx

import React, { useState } from 'react';

const CardLimitsControl = ({ cardId, currentLimits, onUpdate }) => {
  const [limits, setLimits] = useState({
    dailySpendLimit: currentLimits?.dailySpendLimit || 5000,
    monthlySpendLimit: currentLimits?.monthlySpendLimit || 50000,
    atmDailyLimit: currentLimits?.atmDailyLimit || 1000,
    onlinePurchaseLimit: currentLimits?.onlinePurchaseLimit || 10000,
    perTransactionLimit: currentLimits?.perTransactionLimit || 5000
  });

  const [editMode, setEditMode] = useState(false);

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cards/${cardId}/limits`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(limits)
      });

      if (response.ok) {
        setEditMode(false);
        onUpdate && onUpdate(limits);
      }
    } catch (err) {
      console.error('Failed to update limits:', err);
    }
  };

  return (
    <div className="card-limits-section">
      <div className="section-header">
        <h3>Spending Limits</h3>
        <button 
          className="btn btn-secondary btn-small"
          onClick={() => editMode ? handleSave() : setEditMode(true)}
        >
          {editMode ? 'Save Changes' : 'Edit Limits'}
        </button>
      </div>

      <div className="limits-grid">
        {/* Daily Spending Limit */}
        <div className="limit-item">
          <div className="limit-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div className="limit-label">Daily Spending Limit</div>
          </div>
          {editMode ? (
            <input
              type="number"
              className="limit-input"
              value={limits.dailySpendLimit}
              onChange={(e) => setLimits({...limits, dailySpendLimit: parseFloat(e.target.value)})}
            />
          ) : (
            <div className="limit-value">${limits.dailySpendLimit.toLocaleString()}</div>
          )}
          <div className="limit-usage">
            <div className="usage-bar">
              <div className="usage-fill" style={{width: '45%'}}></div>
            </div>
            <span className="usage-text">$2,250 used today</span>
          </div>
        </div>

        {/* Monthly Spending Limit */}
        <div className="limit-item">
          <div className="limit-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <div className="limit-label">Monthly Spending Limit</div>
          </div>
          {editMode ? (
            <input
              type="number"
              className="limit-input"
              value={limits.monthlySpendLimit}
              onChange={(e) => setLimits({...limits, monthlySpendLimit: parseFloat(e.target.value)})}
            />
          ) : (
            <div className="limit-value">${limits.monthlySpendLimit.toLocaleString()}</div>
          )}
          <div className="limit-usage">
            <div className="usage-bar">
              <div className="usage-fill" style={{width: '62%'}}></div>
            </div>
            <span className="usage-text">$31,000 used this month</span>
          </div>
        </div>

        {/* ATM Daily Limit */}
        <div className="limit-item">
          <div className="limit-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
            <div className="limit-label">ATM Daily Limit</div>
          </div>
          {editMode ? (
            <input
              type="number"
              className="limit-input"
              value={limits.atmDailyLimit}
              onChange={(e) => setLimits({...limits, atmDailyLimit: parseFloat(e.target.value)})}
            />
          ) : (
            <div className="limit-value">${limits.atmDailyLimit.toLocaleString()}</div>
          )}
        </div>

        {/* Online Purchase Limit */}
        <div className="limit-item">
          <div className="limit-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <div className="limit-label">Online Purchase Limit</div>
          </div>
          {editMode ? (
            <input
              type="number"
              className="limit-input"
              value={limits.onlinePurchaseLimit}
              onChange={(e) => setLimits({...limits, onlinePurchaseLimit: parseFloat(e.target.value)})}
            />
          ) : (
            <div className="limit-value">${limits.onlinePurchaseLimit.toLocaleString()}</div>
          )}
        </div>

        {/* Per Transaction Limit */}
        <div className="limit-item">
          <div className="limit-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <div className="limit-label">Per Transaction Limit</div>
          </div>
          {editMode ? (
            <input
              type="number"
              className="limit-input"
              value={limits.perTransactionLimit}
              onChange={(e) => setLimits({...limits, perTransactionLimit: parseFloat(e.target.value)})}
            />
          ) : (
            <div className="limit-value">${limits.perTransactionLimit.toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* Merchant Category Controls */}
      <div className="merchant-restrictions">
        <h4>Merchant Category Restrictions</h4>
        <div className="restriction-options">
          <label className="restriction-option">
            <input type="checkbox" />
            <span>Block Gambling</span>
          </label>
          <label className="restriction-option">
            <input type="checkbox" />
            <span>Block Adult Content</span>
          </label>
          <label className="restriction-option">
            <input type="checkbox" />
            <span>Block Cryptocurrency</span>
          </label>
          <label className="restriction-option">
            <input type="checkbox" />
            <span>Block International ATMs</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CardLimitsControl;
```

---

### PHASE 3: Virtual Cards & Advanced Security (Week 4-5)

#### 3.1 Virtual Card Generator

**Component**: `VirtualCardGenerator.jsx`

```javascript
// FILE: components/cards/VirtualCardGenerator.jsx

import React, { useState } from 'react';

const VirtualCardGenerator = ({ physicalCardId }) => {
  const [virtualCards, setVirtualCards] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const cardTypes = [
    {
      type: 'single-use',
      icon: '🔒',
      title: 'Single-Use Card',
      description: 'Use once for a specific purchase, then expires',
      color: '#EF4444'
    },
    {
      type: 'merchant-locked',
      icon: '🏪',
      title: 'Merchant-Locked Card',
      description: 'Only works at a specific merchant',
      color: '#3B82F6'
    },
    {
      type: 'subscription',
      icon: '🔄',
      title: 'Subscription Card',
      description: 'For recurring payments with spending limits',
      color: '#8B5CF6'
    },
    {
      type: 'burner',
      icon: '⏱️',
      title: 'Temporary Card',
      description: 'Expires after a set time period',
      color: '#F59E0B'
    }
  ];

  const createVirtualCard = async (type) => {
    try {
      const response = await fetch(`/api/cards/${physicalCardId}/virtual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      const data = await response.json();
      setVirtualCards([...virtualCards, data.card]);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create virtual card:', err);
    }
  };

  return (
    <div className="virtual-cards-section">
      <div className="section-header">
        <h3>Virtual Cards</h3>
        <button 
          className="btn btn-primary btn-small"
          onClick={() => setShowCreateModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 4v16m8-8H4"/>
          </svg>
          Create Virtual Card
        </button>
      </div>

      {/* Virtual Cards List */}
      <div className="virtual-cards-grid">
        {virtualCards.map(card => (
          <div key={card.id} className="virtual-card-item">
            <div className="virtual-card-header">
              <span className="virtual-card-type-icon">{card.icon}</span>
              <span className="virtual-card-type">{card.typeName}</span>
              <span className={`virtual-card-status ${card.status}`}>
                {card.status}
              </span>
            </div>
            <div className="virtual-card-number">****  ****  ****  {card.last4}</div>
            <div className="virtual-card-meta">
              <span>Expires: {card.expiryDate}</span>
              <span>Used: ${card.amountUsed.toFixed(2)}</span>
            </div>
            <div className="virtual-card-actions">
              <button className="btn-link">View Details</button>
              <button className="btn-link text-red">Delete</button>
            </div>
          </div>
        ))}

        {virtualCards.length === 0 && (
          <div className="virtual-cards-empty">
            <p>No virtual cards created yet</p>
            <p className="empty-subtitle">
              Create virtual cards for safer online shopping
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Virtual Card</h3>
              <button onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">
                Choose the type of virtual card you want to create
              </p>
              <div className="card-type-grid">
                {cardTypes.map(type => (
                  <div 
                    key={type.type}
                    className="card-type-option"
                    onClick={() => createVirtualCard(type.type)}
                  >
                    <div className="type-icon" style={{backgroundColor: `${type.color}20`, color: type.color}}>
                      {type.icon}
                    </div>
                    <h4>{type.title}</h4>
                    <p>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCardGenerator;
```

---

### PHASE 4: Rewards & Benefits (Week 6)

#### 4.1 Rewards Tracker

```javascript
// Add rewards section showing:
// - Current points/cashback balance
// - Points earned this month
// - Redemption options
// - Rewards history
// - Special offers
```

---

### PHASE 5: Enhanced Security & Alerts (Week 7)

#### 5.1 PIN Management

```javascript
// Add:
// - Change PIN
// - View PIN (with biometric auth)
// - Reset PIN (with identity verification)
```

#### 5.2 Alert Preferences

```javascript
// Add customizable alerts for:
// - Transaction thresholds
// - Suspicious activity
// - International usage
// - Balance alerts
// - Payment due reminders
```

---

### PHASE 6: Card Benefits & Details (Week 8)

#### 6.1 Card Benefits Display

```javascript
// Show:
// - Travel insurance coverage
// - Purchase protection
// - Extended warranty
// - Price protection
// - Lounge access (with QR code)
// - Concierge service contact
```

---

## 📋 QUICK IMPLEMENTATION CHECKLIST

### Week 1-2: Transaction History
- [ ] Create CardTransactionHistory component
- [ ] Add filter options (all, week, month, year)
- [ ] Add search functionality
- [ ] Add export to CSV/PDF
- [ ] Show merchant logos
- [ ] Display transaction status

### Week 3: Limits & Controls
- [ ] Create CardLimitsControl component
- [ ] Add daily spending limit with usage bar
- [ ] Add monthly spending limit
- [ ] Add ATM withdrawal limit
- [ ] Add online purchase limit
- [ ] Add per-transaction limit
- [ ] Add merchant category restrictions

### Week 4-5: Virtual Cards
- [ ] Create VirtualCardGenerator component
- [ ] Single-use card generation
- [ ] Merchant-locked cards
- [ ] Subscription cards
- [ ] Temporary/burner cards
- [ ] Virtual card management

### Week 6: Rewards
- [ ] Create RewardsTracker component
- [ ] Show current balance
- [ ] Points history
- [ ] Redemption catalog
- [ ] Cashback tracker

### Week 7: Security
- [ ] PIN management (change/view/reset)
- [ ] Alert preferences
- [ ] Fraud reporting workflow
- [ ] Travel notice feature

### Week 8: Benefits
- [ ] Display card benefits
- [ ] Insurance coverage details
- [ ] Lounge access QR code
- [ ] Concierge contact info

---

## 🎯 SUCCESS METRICS

**Current State:**
- Good: Card visualization, basic controls
- Missing: Transaction history, limits, virtual cards, rewards

**After Optimization:**
- ✅ Full transaction history with search/filter
- ✅ Configurable spending limits (5 types)
- ✅ Virtual card generation (4 types)
- ✅ Rewards tracking & redemption
- ✅ PIN management
- ✅ Enhanced security controls
- ✅ Card benefits display
- ✅ Alert preferences
- ✅ Fraud reporting
- ✅ Statement downloads

---

## 💡 ADDITIONAL FEATURES TO CONSIDER

1. **Apple Pay/Google Pay Status** - Show if card is added to wallet
2. **Recurring Payment Manager** - List subscriptions on this card
3. **Travel Notice** - Add travel dates to prevent blocks
4. **Authorized Users** - Add family members with limits
5. **Card Comparison** - When applying for new card
6. **Payment Due Widget** - For credit cards
7. **Spending by Category** - Pie chart breakdown
8. **Merchant Frequency** - Top 10 merchants
9. **Budget Tracking** - Set category budgets
10. **Card Delivery Tracking** - After requesting replacement

---

**Your Cards Center is already the best page! With these enhancements, it will be world-class and industry-leading.**
