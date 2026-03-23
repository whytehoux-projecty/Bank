# MONEY TRANSFER ENHANCEMENT IMPLEMENTATION GUIDE - PART 2
## Phases 4-8: Advanced Features

---

## PHASE 4: Fee Calculator & Cost Display (Week 7)

**Priority: MEDIUM-HIGH**

### 4.1 Dynamic Fee Calculator Component

**Component**: `FeeCalculator.jsx`

```javascript
// FILE: components/transfer/FeeCalculator.jsx

import React, { useState, useEffect } from 'react';

const FEE_STRUCTURE = {
  internal: {
    baseFee: 0,
    percentage: 0,
    description: 'No fees for internal transfers'
  },
  ach: {
    baseFee: 0,
    percentage: 0,
    description: 'Free ACH transfers'
  },
  wire: {
    baseFee: 25,
    percentage: 0,
    description: 'Flat fee for domestic wires',
    expressAvailable: true,
    expressFee: 35
  },
  zelle: {
    baseFee: 0,
    percentage: 0,
    description: 'Free with Zelle',
    limits: { daily: 2500, monthly: 20000 }
  },
  international: {
    baseFee: 45,
    percentage: 0.03, // 3%
    minFee: 45,
    maxFee: 150,
    description: 'International wire fees',
    fxSpread: 0.015 // 1.5% FX markup
  }
};

const FeeCalculator = ({ 
  transferMethod, 
  amount, 
  currency = 'USD',
  targetCurrency = 'USD',
  express = false 
}) => {
  const [feeBreakdown, setFeeBreakdown] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  useEffect(() => {
    calculateFees();
    if (targetCurrency !== 'USD') {
      fetchExchangeRate();
    }
  }, [transferMethod, amount, currency, targetCurrency, express]);

  const calculateFees = () => {
    if (!transferMethod || !amount || amount <= 0) {
      setFeeBreakdown(null);
      return;
    }

    const feeConfig = FEE_STRUCTURE[transferMethod.id] || {};
    let baseFee = feeConfig.baseFee || 0;
    let percentageFee = 0;
    let totalFee = 0;

    // Calculate percentage fee
    if (feeConfig.percentage) {
      percentageFee = parseFloat(amount) * feeConfig.percentage;
    }

    // Add base fee
    totalFee = baseFee + percentageFee;

    // Apply min/max constraints
    if (feeConfig.minFee && totalFee < feeConfig.minFee) {
      totalFee = feeConfig.minFee;
    }
    if (feeConfig.maxFee && totalFee > feeConfig.maxFee) {
      totalFee = feeConfig.maxFee;
    }

    // Express fee
    if (express && feeConfig.expressAvailable) {
      baseFee = feeConfig.expressFee;
      totalFee = baseFee + percentageFee;
    }

    // FX markup for international
    let fxMarkup = 0;
    if (transferMethod.id === 'international' && targetCurrency !== 'USD') {
      fxMarkup = parseFloat(amount) * (feeConfig.fxSpread || 0);
    }

    setFeeBreakdown({
      baseFee,
      percentageFee,
      fxMarkup,
      totalFee: totalFee + fxMarkup,
      transferAmount: parseFloat(amount),
      totalCost: parseFloat(amount) + totalFee + fxMarkup,
      recipientReceives: parseFloat(amount) - fxMarkup
    });
  };

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(
        `/api/exchange-rates?from=${currency}&to=${targetCurrency}`
      );
      const data = await response.json();
      setExchangeRate(data.rate);
    } catch (err) {
      console.error('Failed to fetch exchange rate:', err);
    }
  };

  if (!feeBreakdown) return null;

  return (
    <div className="fee-calculator">
      <div className="fee-calculator-header">
        <h4>Cost Breakdown</h4>
        {transferMethod.id === 'wire' && (
          <label className="express-toggle">
            <input
              type="checkbox"
              checked={express}
              onChange={(e) => onExpressChange?.(e.target.checked)}
            />
            <span>Express ({FEE_STRUCTURE.wire.expressFee})</span>
          </label>
        )}
      </div>

      <div className="fee-breakdown">
        {/* Transfer Amount */}
        <div className="fee-line">
          <span>Transfer amount</span>
          <span className="amount">${feeBreakdown.transferAmount.toFixed(2)}</span>
        </div>

        {/* Base Fee */}
        {feeBreakdown.baseFee > 0 && (
          <div className="fee-line">
            <span>
              {express ? 'Express ' : ''}Transfer fee
            </span>
            <span className="fee">${feeBreakdown.baseFee.toFixed(2)}</span>
          </div>
        )}

        {/* Percentage Fee */}
        {feeBreakdown.percentageFee > 0 && (
          <div className="fee-line">
            <span>Processing fee ({(FEE_STRUCTURE[transferMethod.id].percentage * 100).toFixed(1)}%)</span>
            <span className="fee">${feeBreakdown.percentageFee.toFixed(2)}</span>
          </div>
        )}

        {/* FX Markup */}
        {feeBreakdown.fxMarkup > 0 && (
          <div className="fee-line">
            <span>
              FX markup
              <span className="info-icon" title="Exchange rate difference">ℹ️</span>
            </span>
            <span className="fee">${feeBreakdown.fxMarkup.toFixed(2)}</span>
          </div>
        )}

        {/* Exchange Rate */}
        {exchangeRate && (
          <div className="fee-line info">
            <span>Exchange rate</span>
            <span>1 {currency} = {exchangeRate.toFixed(4)} {targetCurrency}</span>
          </div>
        )}

        {/* Divider */}
        <div className="fee-divider"></div>

        {/* Total Cost */}
        <div className="fee-line total">
          <span>Total cost</span>
          <span className="total-amount">${feeBreakdown.totalCost.toFixed(2)}</span>
        </div>

        {/* Recipient Receives */}
        {targetCurrency !== 'USD' && (
          <div className="fee-line recipient">
            <span>Recipient receives</span>
            <span className="recipient-amount">
              {(feeBreakdown.recipientReceives * exchangeRate).toFixed(2)} {targetCurrency}
            </span>
          </div>
        )}
      </div>

      {/* Savings Alert */}
      {feeBreakdown.totalFee === 0 && (
        <div className="savings-alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          You're saving ${(25).toFixed(2)} in fees with this method!
        </div>
      )}

      {/* Fee Comparison */}
      {feeBreakdown.totalFee > 0 && (
        <button className="btn-link" onClick={() => showFeeComparison()}>
          Compare with other methods
        </button>
      )}
    </div>
  );
};

export default FeeCalculator;
```

**Styling**:

```css
/* FILE: styles/components/fee-calculator.css */

.fee-calculator {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.fee-calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.fee-calculator-header h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.express-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
  cursor: pointer;
}

.express-toggle input {
  cursor: pointer;
}

.fee-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.fee-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.fee-line span:first-child {
  color: #6B7280;
}

.fee-line .amount {
  font-family: monospace;
  font-weight: 600;
  color: #1F2937;
}

.fee-line .fee {
  font-family: monospace;
  color: #DC2626;
}

.fee-line.info {
  font-size: 12px;
  color: #9CA3AF;
}

.info-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-left: 4px;
  cursor: help;
  opacity: 0.6;
}

.fee-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 8px 0;
}

.fee-line.total {
  padding-top: 8px;
  font-size: 16px;
}

.fee-line.total span:first-child {
  font-weight: 600;
  color: #1F2937;
}

.total-amount {
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
  color: #2C3E5C !important;
}

.fee-line.recipient {
  background: #F0FDF4;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 4px;
}

.recipient-amount {
  font-family: monospace;
  font-weight: 600;
  color: #10B981 !important;
}

.savings-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ECFDF5;
  color: #065F46;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;
}

.savings-alert svg {
  color: #10B981;
  flex-shrink: 0;
}

.btn-link {
  background: none;
  border: none;
  color: #D4A574;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  padding: 0;
  text-decoration: underline;
}

.btn-link:hover {
  color: #B8824A;
}
```

---

## PHASE 5: Scheduled & Recurring Transfers (Week 8-9)

**Priority: MEDIUM**

### 5.1 Schedule Transfer Component

**Component**: `ScheduleTransfer.jsx`

```javascript
// FILE: components/transfer/ScheduleTransfer.jsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ScheduleTransfer = ({ onScheduleChange }) => {
  const [scheduleType, setScheduleType] = useState('now'); // 'now', 'once', 'recurring'
  const [scheduleDate, setScheduleDate] = useState(null);
  const [frequency, setFrequency] = useState('weekly'); // 'daily', 'weekly', 'biweekly', 'monthly'
  const [endType, setEndType] = useState('never'); // 'never', 'after', 'on'
  const [endAfterOccurrences, setEndAfterOccurrences] = useState(12);
  const [endOnDate, setEndOnDate] = useState(null);

  const handleChange = (updates) => {
    const schedule = {
      type: scheduleType,
      date: scheduleDate,
      frequency: scheduleType === 'recurring' ? frequency : null,
      endType: scheduleType === 'recurring' ? endType : null,
      endAfterOccurrences: endType === 'after' ? endAfterOccurrences : null,
      endOnDate: endType === 'on' ? endOnDate : null,
      ...updates
    };
    onScheduleChange(schedule);
  };

  return (
    <div className="schedule-transfer">
      <label className="input-label">When to transfer</label>

      {/* Schedule Type Selector */}
      <div className="schedule-types">
        <div
          className={`schedule-type-card ${scheduleType === 'now' ? 'selected' : ''}`}
          onClick={() => {
            setScheduleType('now');
            handleChange({ type: 'now' });
          }}
        >
          <div className="type-icon">⚡</div>
          <div className="type-name">Now</div>
          <div className="type-description">Process immediately</div>
        </div>

        <div
          className={`schedule-type-card ${scheduleType === 'once' ? 'selected' : ''}`}
          onClick={() => setScheduleType('once')}
        >
          <div className="type-icon">📅</div>
          <div className="type-name">Schedule Once</div>
          <div className="type-description">Pick a future date</div>
        </div>

        <div
          className={`schedule-type-card ${scheduleType === 'recurring' ? 'selected' : ''}`}
          onClick={() => setScheduleType('recurring')}
        >
          <div className="type-icon">🔄</div>
          <div className="type-name">Recurring</div>
          <div className="type-description">Set up auto-transfer</div>
        </div>
      </div>

      {/* Schedule Once Options */}
      {scheduleType === 'once' && (
        <div className="schedule-options">
          <div className="form-group">
            <label>Transfer date</label>
            <DatePicker
              selected={scheduleDate}
              onChange={(date) => {
                setScheduleDate(date);
                handleChange({ date });
              }}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select date"
              className="date-input"
            />
          </div>

          {scheduleDate && (
            <div className="schedule-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Transfer will be processed on {scheduleDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
        </div>
      )}

      {/* Recurring Transfer Options */}
      {scheduleType === 'recurring' && (
        <div className="schedule-options">
          {/* Frequency */}
          <div className="form-group">
            <label>Frequency</label>
            <div className="frequency-options">
              {[
                { value: 'daily', label: 'Daily', icon: '📆' },
                { value: 'weekly', label: 'Weekly', icon: '📅' },
                { value: 'biweekly', label: 'Bi-weekly', icon: '🗓️' },
                { value: 'monthly', label: 'Monthly', icon: '📋' }
              ].map(option => (
                <div
                  key={option.value}
                  className={`frequency-option ${frequency === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    setFrequency(option.value);
                    handleChange({ frequency: option.value });
                  }}
                >
                  <span className="freq-icon">{option.icon}</span>
                  <span>{option.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="form-group">
            <label>Start date</label>
            <DatePicker
              selected={scheduleDate}
              onChange={(date) => {
                setScheduleDate(date);
                handleChange({ date });
              }}
              minDate={new Date()}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select start date"
              className="date-input"
            />
          </div>

          {/* End Options */}
          <div className="form-group">
            <label>End</label>
            <div className="end-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="endType"
                  value="never"
                  checked={endType === 'never'}
                  onChange={(e) => {
                    setEndType(e.target.value);
                    handleChange({ endType: e.target.value });
                  }}
                />
                <span>Never</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="endType"
                  value="after"
                  checked={endType === 'after'}
                  onChange={(e) => setEndType(e.target.value)}
                />
                <span>After</span>
                {endType === 'after' && (
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={endAfterOccurrences}
                    onChange={(e) => {
                      setEndAfterOccurrences(parseInt(e.target.value));
                      handleChange({ endAfterOccurrences: parseInt(e.target.value) });
                    }}
                    className="occurrences-input"
                  />
                )}
                <span>transfers</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="endType"
                  value="on"
                  checked={endType === 'on'}
                  onChange={(e) => setEndType(e.target.value)}
                />
                <span>On</span>
                {endType === 'on' && (
                  <DatePicker
                    selected={endOnDate}
                    onChange={(date) => {
                      setEndOnDate(date);
                      handleChange({ endOnDate: date });
                    }}
                    minDate={scheduleDate || new Date()}
                    dateFormat="MMM d, yyyy"
                    placeholderText="End date"
                    className="date-input-small"
                  />
                )}
              </label>
            </div>
          </div>

          {/* Preview */}
          {scheduleDate && (
            <div className="recurring-preview">
              <h5>Preview</h5>
              <div className="preview-info">
                <div className="preview-line">
                  <span>First transfer:</span>
                  <strong>{scheduleDate.toLocaleDateString()}</strong>
                </div>
                <div className="preview-line">
                  <span>Frequency:</span>
                  <strong>Every {frequency}</strong>
                </div>
                {endType === 'after' && (
                  <div className="preview-line">
                    <span>Total transfers:</span>
                    <strong>{endAfterOccurrences}</strong>
                  </div>
                )}
                {endType === 'on' && endOnDate && (
                  <div className="preview-line">
                    <span>Last transfer:</span>
                    <strong>{endOnDate.toLocaleDateString()}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleTransfer;
```

**Styling**:

```css
/* FILE: styles/components/schedule-transfer.css */

.schedule-transfer {
  margin-bottom: 24px;
}

.schedule-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.schedule-type-card {
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.schedule-type-card:hover {
  border-color: #D4A574;
  transform: translateY(-2px);
}

.schedule-type-card.selected {
  border-color: #D4A574;
  background: linear-gradient(to bottom, #FFFBF5, white);
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.type-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.type-name {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.type-description {
  font-size: 12px;
  color: #6B7280;
}

.schedule-options {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
}

.frequency-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.frequency-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.frequency-option:hover {
  border-color: #D4A574;
}

.frequency-option.selected {
  border-color: #D4A574;
  background: #FFFBF5;
}

.freq-icon {
  font-size: 20px;
}

.date-input,
.date-input-small {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
}

.date-input:focus,
.date-input-small:focus {
  outline: none;
  border-color: #D4A574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.schedule-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #EFF6FF;
  color: #1E40AF;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
}

.schedule-info svg {
  color: #3B82F6;
  flex-shrink: 0;
}

.end-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  cursor: pointer;
}

.occurrences-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  text-align: center;
}

.recurring-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #E5E7EB;
}

.recurring-preview h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 12px;
}

.preview-info {
  background: #F9FAFB;
  padding: 16px;
  border-radius: 8px;
}

.preview-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
}

.preview-line span {
  color: #6B7280;
}

.preview-line strong {
  color: #1F2937;
}
```

---

## PHASE 6: Transfer Confirmation & Receipt (Week 10)

**Priority: HIGH**

### 6.1 Confirmation Modal

**Component**: `TransferConfirmation.jsx`

```javascript
// FILE: components/transfer/TransferConfirmation.jsx

import React, { useState } from 'react';

const TransferConfirmation = ({ 
  transferData, 
  onConfirm, 
  onCancel,
  isOpen 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('review'); // 'review', 'verify', 'processing', 'success'
  const [error, setError] = useState(null);

  const handleConfirm = async () => {
    setStep('verify');
    // Send OTP/verification code
    try {
      await sendVerificationCode();
    } catch (err) {
      setError('Failed to send verification code');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setStep('processing');
    setError(null);

    try {
      const result = await onConfirm({
        ...transferData,
        verificationCode
      });
      
      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Transfer failed');
        setStep('verify');
      }
    } catch (err) {
      setError(err.message);
      setStep('verify');
    }
  };

  const sendVerificationCode = async () => {
    await fetch('/api/transfers/send-otp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        {/* Review Step */}
        {step === 'review' && (
          <>
            <div className="modal-header">
              <h3>Review Transfer</h3>
              <button className="close-btn" onClick={onCancel}>×</button>
            </div>

            <div className="modal-body">
              <div className="transfer-summary">
                <div className="summary-section">
                  <div className="section-title">From</div>
                  <div className="account-detail">
                    <div className="account-name">{transferData.fromAccount.name}</div>
                    <div className="account-number">
                      ****{transferData.fromAccount.accountNumber.slice(-4)}
                    </div>
                  </div>
                </div>

                <div className="transfer-arrow">→</div>

                <div className="summary-section">
                  <div className="section-title">To</div>
                  <div className="account-detail">
                    <div className="account-name">{transferData.beneficiary.name}</div>
                    <div className="account-number">
                      ****{transferData.beneficiary.accountNumber.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="transfer-details">
                <div className="detail-row">
                  <span>Transfer amount</span>
                  <strong>${transferData.amount.toFixed(2)}</strong>
                </div>
                {transferData.fees > 0 && (
                  <div className="detail-row">
                    <span>Fee</span>
                    <span className="fee">${transferData.fees.toFixed(2)}</span>
                  </div>
                )}
                <div className="detail-row total">
                  <span>Total</span>
                  <strong>${(transferData.amount + transferData.fees).toFixed(2)}</strong>
                </div>

                <div className="detail-divider"></div>

                <div className="detail-row">
                  <span>Transfer type</span>
                  <span>{transferData.method.name}</span>
                </div>
                <div className="detail-row">
                  <span>Processing time</span>
                  <span>{transferData.method.speed}</span>
                </div>
                {transferData.reference && (
                  <div className="detail-row">
                    <span>Reference</span>
                    <span>{transferData.reference}</span>
                  </div>
                )}
                {transferData.schedule?.type !== 'now' && (
                  <div className="detail-row">
                    <span>Scheduled for</span>
                    <span>{transferData.schedule.date.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="security-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                We'll send a verification code to your registered mobile number
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Confirm Transfer
              </button>
            </div>
          </>
        )}

        {/* Verification Step */}
        {step === 'verify' && (
          <>
            <div className="modal-header">
              <h3>Enter Verification Code</h3>
            </div>

            <div className="modal-body">
              <div className="verification-info">
                We've sent a 6-digit code to your phone ending in ••••{transferData.phone?.slice(-4)}
              </div>

              <div className="otp-input-group">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="otp-input"
                  autoFocus
                />
              </div>

              {error && (
                <div className="error-message">{error}</div>
              )}

              <button 
                className="btn-link"
                onClick={sendVerificationCode}
              >
                Resend code
              </button>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setStep('review')}>
                Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleVerify}
                disabled={verificationCode.length !== 6}
              >
                Verify & Transfer
              </button>
            </div>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <>
            <div className="modal-body processing">
              <div className="processing-animation">
                <div className="spinner"></div>
              </div>
              <h3>Processing Transfer...</h3>
              <p>Please don't close this window</p>
            </div>
          </>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <>
            <div className="modal-body success">
              <div className="success-icon">✓</div>
              <h3>Transfer Successful!</h3>
              <p>Your transfer has been processed successfully</p>

              <div className="success-details">
                <div className="detail-row">
                  <span>Amount</span>
                  <strong>${transferData.amount.toFixed(2)}</strong>
                </div>
                <div className="detail-row">
                  <span>Reference number</span>
                  <strong className="ref-number">{transferData.referenceNumber}</strong>
                </div>
              </div>

              <div className="success-actions">
                <button className="btn btn-secondary" onClick={() => downloadReceipt()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m14-7l-5-5m0 0L7 8m5-5v12"/>
                  </svg>
                  Download Receipt
                </button>
                <button className="btn btn-primary" onClick={onCancel}>
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransferConfirmation;
```

**Styling**:

```css
/* FILE: styles/components/transfer-confirmation.css */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.confirmation-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
}

.modal-header h3 {
  font-family: serif;
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #F3F4F6;
  border-radius: 50%;
  font-size: 24px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #E5E7EB;
}

.modal-body {
  padding: 24px;
}

.transfer-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.summary-section {
  flex: 1;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.account-detail {
  background: #F9FAFB;
  padding: 12px;
  border-radius: 8px;
}

.account-name {
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
}

.account-number {
  font-family: monospace;
  font-size: 13px;
  color: #6B7280;
}

.transfer-arrow {
  font-size: 24px;
  color: #D4A574;
  flex-shrink: 0;
}

.transfer-details {
  background: #F9FAFB;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.detail-row span:first-child {
  color: #6B7280;
}

.detail-row strong {
  color: #1F2937;
  font-family: monospace;
}

.detail-row .fee {
  color: #DC2626;
  font-family: monospace;
}

.detail-row.total {
  font-size: 16px;
  padding-top: 12px;
  border-top: 2px solid #E5E7EB;
  margin-top: 4px;
}

.detail-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 12px 0;
}

.security-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #EFF6FF;
  color: #1E40AF;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
}

.security-notice svg {
  color: #3B82F6;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #E5E7EB;
}

.modal-footer .btn {
  flex: 1;
}

/* Verification Step */
.verification-info {
  text-align: center;
  color: #6B7280;
  margin-bottom: 24px;
}

.otp-input-group {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.otp-input {
  width: 200px;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  text-align: center;
  font-size: 24px;
  font-family: monospace;
  letter-spacing: 8px;
  transition: all 0.2s ease;
}

.otp-input:focus {
  outline: none;
  border-color: #D4A574;
  box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
}

.error-message {
  background: #FEE2E2;
  color: #DC2626;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 16px;
}

/* Processing Step */
.modal-body.processing {
  text-align: center;
  padding: 48px 24px;
}

.processing-animation {
  margin-bottom: 24px;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 4px solid #E5E7EB;
  border-top-color: #D4A574;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Success Step */
.modal-body.success {
  text-align: center;
  padding: 48px 24px;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 24px;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.success-details {
  background: #F0FDF4;
  padding: 20px;
  border-radius: 12px;
  margin: 24px 0;
}

.ref-number {
  font-family: monospace;
  color: #059669 !important;
}

.success-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.success-actions .btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

---

## PHASE 7: Additional Transfer Methods (Week 11-12)

### 7.1 Zelle Transfer Implementation

**Component**: `ZelleTransfer.jsx`

```javascript
// FILE: components/transfer/methods/ZelleTransfer.jsx

import React, { useState, useEffect } from 'react';

const ZelleTransfer = ({ onComplete }) => {
  const [contactMethod, setContactMethod] = useState('email'); // 'email' or 'phone'
  const [contactValue, setContactValue] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [errors, setErrors] = useState({});
  const [dailyLimit, setDailyLimit] = useState({ used: 0, total: 2500 });

  useEffect(() => {
    fetchZelleLimits();
  }, []);

  const fetchZelleLimits = async () => {
    try {
      const response = await fetch('/api/transfers/zelle/limits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setDailyLimit(data.limits);
    } catch (err) {
      console.error('Failed to fetch Zelle limits:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!contactValue) {
      newErrors.contact = `${contactMethod === 'email' ? 'Email' : 'Phone'} is required`;
    } else if (contactMethod === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactValue)) {
        newErrors.contact = 'Invalid email address';
      }
    } else {
      const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
      if (!phoneRegex.test(contactValue)) {
        newErrors.contact = 'Invalid phone number';
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(amount) > (dailyLimit.total - dailyLimit.used)) {
      newErrors.amount = `Amount exceeds daily limit (${dailyLimit.total - dailyLimit.used} remaining)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    onComplete({
      method: 'zelle',
      contact: contactValue,
      contactMethod,
      recipientName,
      amount: parseFloat(amount),
      memo
    });
  };

  const remainingLimit = dailyLimit.total - dailyLimit.used;

  return (
    <form className="zelle-transfer-form" onSubmit={handleSubmit}>
      {/* Zelle Header */}
      <div className="method-header zelle">
        <div className="method-logo">
          <span className="zelle-icon">Z</span>
        </div>
        <div className="method-info">
          <h3>Zelle Transfer</h3>
          <p>Send money instantly with email or mobile number</p>
        </div>
      </div>

      {/* Daily Limit Info */}
      <div className="limit-banner">
        <div className="limit-info">
          <span>Daily limit remaining:</span>
          <strong>${remainingLimit.toFixed(2)}</strong>
        </div>
        <div className="limit-bar">
          <div 
            className="limit-used"
            style={{ width: `${(dailyLimit.used / dailyLimit.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contact Method Selector */}
      <div className="form-group">
        <label>Send to</label>
        <div className="contact-method-tabs">
          <button
            type="button"
            className={`contact-tab ${contactMethod === 'email' ? 'active' : ''}`}
            onClick={() => setContactMethod('email')}
          >
            📧 Email
          </button>
          <button
            type="button"
            className={`contact-tab ${contactMethod === 'phone' ? 'active' : ''}`}
            onClick={() => setContactMethod('phone')}
          >
            📱 Phone
          </button>
        </div>
      </div>

      {/* Contact Input */}
      <div className="form-group">
        <label>
          {contactMethod === 'email' ? 'Email Address' : 'Phone Number'}
        </label>
        <input
          type={contactMethod === 'email' ? 'email' : 'tel'}
          placeholder={contactMethod === 'email' ? 'recipient@example.com' : '(555) 123-4567'}
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          className={errors.contact ? 'error' : ''}
        />
        {errors.contact && <span className="error-text">{errors.contact}</span>}
      </div>

      {/* Recipient Name */}
      <div className="form-group">
        <label>Recipient Name (Optional)</label>
        <input
          type="text"
          placeholder="John Doe"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
        />
      </div>

      {/* Amount */}
      <div className="form-group">
        <label>Amount</label>
        <div className="amount-input-wrapper">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={remainingLimit}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`amount-input ${errors.amount ? 'error' : ''}`}
          />
        </div>
        {errors.amount && <span className="error-text">{errors.amount}</span>}
      </div>

      {/* Memo */}
      <div className="form-group">
        <label>Memo (Optional)</label>
        <input
          type="text"
          placeholder="What's this for?"
          maxLength="50"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
        <span className="char-count">{memo.length}/50</span>
      </div>

      {/* Info Box */}
      <div className="info-box zelle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <strong>Instant transfer</strong>
          <p>Money typically arrives within minutes when sent to an enrolled Zelle user</p>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="btn btn-primary btn-large">
        Send with Zelle
      </button>
    </form>
  );
};

export default ZelleTransfer;
```

---

## PHASE 8: Quick Implementation Guide

### Integration Checklist

**Step 1: Install Dependencies**
```bash
npm install react-datepicker idb zustand
```

**Step 2: File Structure**
```
src/
├── components/
│   ├── transfer/
│   │   ├── TransferMethodSelector.jsx
│   │   ├── EnhancedAccountSelector.jsx
│   │   ├── BeneficiarySelector.jsx
│   │   ├── FeeCalculator.jsx
│   │   ├── ScheduleTransfer.jsx
│   │   ├── TransferConfirmation.jsx
│   │   ├── MultiStepTransferForm.jsx
│   │   └── methods/
│   │       ├── ZelleTransfer.jsx
│   │       ├── ACHTransfer.jsx
│   │       └── InternationalTransfer.jsx
├── styles/
│   └── components/
│       ├── transfer-method-selector.css
│       ├── account-selector.css
│       ├── beneficiary-selector.css
│       ├── fee-calculator.css
│       ├── schedule-transfer.css
│       └── transfer-confirmation.css
```

**Step 3: Update Main Transfer Page**
```javascript
// pages/transfer/index.jsx

import TransferMethodSelector from '@/components/transfer/TransferMethodSelector';
import EnhancedAccountSelector from '@/components/transfer/EnhancedAccountSelector';
import BeneficiarySelector from '@/components/transfer/BeneficiarySelector';
import FeeCalculator from '@/components/transfer/FeeCalculator';
import ScheduleTransfer from '@/components/transfer/ScheduleTransfer';

const TransferPage = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({
    fromAccount: null,
    beneficiary: null,
    amount: '',
    reference: '',
    schedule: { type: 'now' }
  });

  return (
    <div className="transfer-page">
      {/* EXISTING: Page Header */}
      <TransferHeader />

      {/* NEW: Method Selector */}
      <TransferMethodSelector 
        selectedMethod={selectedMethod}
        onSelect={setSelectedMethod}
      />

      {selectedMethod && (
        <div className="transfer-layout">
          <div className="transfer-form-column">
            {/* NEW: Enhanced Account Selector */}
            <EnhancedAccountSelector
              value={formData.fromAccount}
              onChange={(account) => setFormData({...formData, fromAccount: account})}
            />

            {/* NEW: Beneficiary Selector */}
            <BeneficiarySelector
              transferMethod={selectedMethod}
              selectedBeneficiary={formData.beneficiary}
              onSelect={(beneficiary) => setFormData({...formData, beneficiary})}
            />

            {/* EXISTING: Amount Input (keep as is) */}
            
            {/* NEW: Schedule Transfer */}
            <ScheduleTransfer
              onScheduleChange={(schedule) => setFormData({...formData, schedule})}
            />

            {/* EXISTING: Reference Input (keep as is) */}

            {/* NEW: Fee Calculator */}
            <FeeCalculator
              transferMethod={selectedMethod}
              amount={formData.amount}
            />

            {/* EXISTING: Submit Button (keep as is) */}
          </div>

          <div className="transfer-sidebar-column">
            {/* EXISTING: Transfer Limits */}
            {/* EXISTING: Security Info */}
          </div>
        </div>
      )}
    </div>
  );
};
```

**Step 4: API Endpoints Needed**

Create these endpoints in your backend:

1. `GET /api/accounts/eligible-for-transfer` - Returns user's accounts
2. `GET /api/beneficiaries?method={method}` - Returns saved beneficiaries
3. `POST /api/beneficiaries` - Add new beneficiary
4. `GET /api/transfers/recent-recipients` - Returns recent transfer recipients
5. `GET /api/transfers/zelle/limits` - Returns Zelle limits
6. `POST /api/transfers/send-otp` - Send verification code
7. `POST /api/transfers/execute` - Execute the transfer
8. `GET /api/exchange-rates?from={from}&to={to}` - Get FX rates

---

## Implementation Priority Matrix

**WEEK 1-2 (Critical)**
✅ Fix account loading error
✅ Enhanced account selector
✅ Transfer method selector

**WEEK 3-4 (High)**
✅ Beneficiary management
✅ Saved recipients
✅ Recent recipients

**WEEK 5-6 (High)**
✅ Multi-step form
✅ Fee calculator
✅ Better validation

**WEEK 7-8 (Medium)**
✅ Scheduled transfers
✅ Recurring transfers

**WEEK 9-10 (High)**
✅ Transfer confirmation
✅ 2FA verification
✅ Receipt download

**WEEK 11-12 (Medium)**
✅ Zelle implementation
✅ International transfers
✅ Additional methods

---

## Testing Guidelines

### Unit Tests
```javascript
// Example test for account selector
describe('EnhancedAccountSelector', () => {
  it('should load accounts on mount', async () => {
    render(<EnhancedAccountSelector />);
    await waitFor(() => {
      expect(screen.getByText(/heritage vault/i)).toBeInTheDocument();
    });
  });

  it('should handle account selection', () => {
    const onChange = jest.fn();
    render(<EnhancedAccountSelector onChange={onChange} />);
    // ... test logic
  });
});
```

### Integration Tests
Test complete transfer flows:
1. Select method → Select accounts → Enter amount → Review → Confirm
2. Save beneficiary during transfer
3. Schedule recurring transfer

---

## Performance Optimization

1. **Lazy load transfer method components**
```javascript
const ZelleTransfer = lazy(() => import('./methods/ZelleTransfer'));
```

2. **Debounce fee calculations**
```javascript
const debouncedCalculateFees = debounce(calculateFees, 300);
```

3. **Cache beneficiary list**
```javascript
const { data: beneficiaries } = useQuery(
  ['beneficiaries', method],
  fetchBeneficiaries,
  { staleTime: 5 * 60 * 1000 } // 5 minutes
);
```

---

## Success Metrics

**Before Enhancement:**
- 2 transfer methods
- No beneficiary management
- No scheduling
- Basic error handling
- Static limits display

**After Enhancement:**
- 6 transfer methods
- Full beneficiary system
- Scheduled & recurring transfers
- Robust error handling with retry
- Dynamic fee calculation
- Multi-step confirmation
- 2FA security
- Receipt generation
- Transfer templates

---

**END OF IMPLEMENTATION GUIDE**

Your AI assistant can now use this guide to systematically implement each feature while preserving your existing design system.
