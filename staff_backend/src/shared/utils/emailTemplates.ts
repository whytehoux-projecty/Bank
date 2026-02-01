/**
 * Email Templates for Staff Portal
 * 
 * This file contains all email template functions for the application.
 * Templates are HTML-based with inline styling for email client compatibility.
 */

// Common styles
const styles = {
  container: `
    font-family: 'Segoe UI', Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `,
  header: `
    background: linear-gradient(135deg, #1a365d, #2c5282);
    color: #ffffff;
    padding: 32px;
    text-align: center;
  `,
  headerLogo: `
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 8px;
  `,
  headerSubtitle: `
    font-size: 14px;
    opacity: 0.9;
    margin: 0;
  `,
  body: `
    padding: 32px;
    color: #374151;
    line-height: 1.6;
  `,
  title: `
    color: #1a365d;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 16px;
  `,
  paragraph: `
    margin: 0 0 16px;
    font-size: 15px;
  `,
  infoBox: `
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  `,
  infoRow: `
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
  `,
  infoLabel: `
    color: #64748b;
  `,
  infoValue: `
    font-weight: 600;
    color: #1e293b;
  `,
  button: `
    display: inline-block;
    background: #1a365d;
    color: #ffffff;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    margin: 16px 0;
  `,
  accentButton: `
    display: inline-block;
    background: #e53e3e;
    color: #ffffff;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 14px;
    margin: 16px 0;
  `,
  footer: `
    background: #f8fafc;
    padding: 24px 32px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    font-size: 12px;
    color: #64748b;
  `,
  statusApproved: `
    display: inline-block;
    background: #f0fff4;
    color: #38a169;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  `,
  statusRejected: `
    display: inline-block;
    background: #fff5f5;
    color: #e53e3e;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  `,
  statusPending: `
    display: inline-block;
    background: #fffaf0;
    color: #dd6b20;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
  `,
};

/**
 * Base template wrapper
 */
function baseTemplate(content: string, subject: string = 'Staff Portal'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f1f5f9;">
  <div style="${styles.container}">
    <div style="${styles.header}">
      <h1 style="${styles.headerLogo}">🏢 Staff Portal</h1>
      <p style="${styles.headerSubtitle}">Global Organization</p>
    </div>
    <div style="${styles.body}">
      ${content}
    </div>
    <div style="${styles.footer}">
      <p style="margin: 0 0 8px;">This is an automated message from the Staff Portal.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} Global Organization. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ============ LOAN TEMPLATES ============

export interface LoanEmailData {
  staffName: string;
  loanId: string;
  amount: number;
  balance?: number;
  dueDate?: string;
  reason?: string;
  portalUrl?: string;
}

export function loanApplicationReceivedTemplate(data: LoanEmailData): string {
  const content = `
    <h2 style="${styles.title}">Loan Application Received</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Thank you for submitting your loan application. We have received your request and it is currently under review.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Reference Number</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.loanId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Amount Requested</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">$${data.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusPending}">Pending Review</span></td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      You will receive a notification once your application has been reviewed. This typically takes 1-3 business days.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Application Status</a>
    </p>
  `;

  return baseTemplate(content, 'Loan Application Received');
}

export function loanApprovedTemplate(data: LoanEmailData): string {
  const content = `
    <h2 style="${styles.title}">🎉 Loan Application Approved!</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Great news! Your loan application has been <strong>approved</strong>. The funds will be processed according to your organization's disbursement schedule.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Reference Number</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.loanId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Approved Amount</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; color: #38a169;">$${data.amount.toLocaleString()}</td>
        </tr>
        ${data.dueDate ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Repayment Due Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.dueDate}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      Please log in to your Staff Portal to view the complete loan details, payment schedule, and generate payment invoices.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Loan Details</a>
    </p>
  `;

  return baseTemplate(content, 'Loan Approved');
}

export function loanRejectedTemplate(data: LoanEmailData & { rejectionReason?: string }): string {
  const content = `
    <h2 style="${styles.title}">Loan Application Update</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Thank you for your loan application. After careful review, we regret to inform you that your application has not been approved at this time.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Reference Number</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.loanId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Amount Requested</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">$${data.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusRejected}">Not Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.rejectionReason ? `
    <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #e53e3e;">Reason:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${data.rejectionReason}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      If you have questions about this decision or would like to discuss your options, please contact the HR department.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">Contact HR</a>
    </p>
  `;

  return baseTemplate(content, 'Loan Application Status');
}

export function paymentReminderTemplate(data: LoanEmailData): string {
  const content = `
    <h2 style="${styles.title}">⏰ Payment Reminder</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      This is a friendly reminder that your loan payment is due. Please ensure timely payment to avoid any late fees or penalties.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Loan Reference</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.loanId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Outstanding Balance</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; color: #e53e3e;">$${(data.balance || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Due Date</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${data.dueDate || 'Immediate'}</td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      You can generate a payment invoice from your Staff Portal, which includes all the bank details and payment reference needed to complete your payment.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.accentButton}">Make Payment Now</a>
    </p>
    
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      If you have already made this payment, please disregard this reminder. For any questions or concerns about your loan, please contact the HR department.
    </p>
  `;

  return baseTemplate(content, 'Loan Payment Reminder');
}

// ============ APPLICATION TEMPLATES ============

export interface ApplicationEmailData {
  staffName: string;
  applicationId: string;
  applicationType: string;
  submittedDate?: string;
  status?: string;
  details?: string;
  portalUrl?: string;
}

export function applicationReceivedTemplate(data: ApplicationEmailData): string {
  const content = `
    <h2 style="${styles.title}">Application Submitted Successfully</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Your ${data.applicationType} request has been submitted and is now pending approval.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Application ID</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusPending}">Pending</span></td>
        </tr>
      </table>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">Track Application</a>
    </p>
  `;

  return baseTemplate(content, 'Application Submitted');
}

export function applicationApprovedTemplate(data: ApplicationEmailData): string {
  const content = `
    <h2 style="${styles.title}">✅ Application Approved</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Your ${data.applicationType} request has been <strong>approved</strong>.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Application ID</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.details ? `<p style="${styles.paragraph}">${data.details}</p>` : ''}
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Details</a>
    </p>
  `;

  return baseTemplate(content, 'Application Approved');
}

export function applicationRejectedTemplate(data: ApplicationEmailData & { reason?: string }): string {
  const content = `
    <h2 style="${styles.title}">Application Status Update</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      We regret to inform you that your ${data.applicationType} request has not been approved.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Application ID</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationId}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.applicationType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusRejected}">Not Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.reason ? `
    <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #e53e3e;">Reason:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${data.reason}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      If you have questions about this decision, please contact the HR department.
    </p>
  `;

  return baseTemplate(content, 'Application Status Update');
}

// ============ PAYROLL TEMPLATES ============

export interface PayrollEmailData {
  staffName: string;
  period: string;
  netPay: number;
  currency?: string;
  paymentDate?: string;
  portalUrl?: string;
}

export function payslipAvailableTemplate(data: PayrollEmailData): string {
  const currency = data.currency || 'USD';
  const content = `
    <h2 style="${styles.title}">💰 Payslip Available</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Your payslip for <strong>${data.period}</strong> is now available in the Staff Portal.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Period</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.period}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Net Pay</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; color: #38a169;">${currency} ${data.netPay.toLocaleString()}</td>
        </tr>
        ${data.paymentDate ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Payment Date</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${data.paymentDate}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View & Download Payslip</a>
    </p>
  `;

  return baseTemplate(content, 'Payslip Available');
}

// ============ GENERAL TEMPLATES ============

export interface WelcomeEmailData {
  staffName: string;
  email: string;
  tempPassword?: string;
  portalUrl?: string;
}

export function welcomeTemplate(data: WelcomeEmailData): string {
  const content = `
    <h2 style="${styles.title}">Welcome to the Team! 🎉</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Welcome to Global Organization! Your Staff Portal account has been created and you can now access all employee resources, submit applications, and manage your profile.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.email}</td>
        </tr>
        ${data.tempPassword ? `
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Temporary Password</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; font-family: monospace;">${data.tempPassword}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    ${data.tempPassword ? `
    <div style="background: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #dd6b20;">⚠️ Important:</strong>
      <p style="margin: 8px 0 0; color: #374151;">Please change your password upon first login.</p>
    </div>
    ` : ''}
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">Log In to Staff Portal</a>
    </p>
  `;

  return baseTemplate(content, 'Welcome to Staff Portal');
}

export function passwordResetTemplate(data: { staffName: string; resetLink: string; expiresIn?: string }): string {
  const content = `
    <h2 style="${styles.title}">Password Reset Request</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      We received a request to reset your Staff Portal password. Click the button below to create a new password.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.resetLink}" style="${styles.accentButton}">Reset Password</a>
    </p>
    
    <p style="${styles.paragraph}">
      This link will expire in ${data.expiresIn || '1 hour'}. If you didn't request this reset, you can safely ignore this email.
    </p>
    
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      If the button doesn't work, copy and paste this link into your browser:
      <br><a href="${data.resetLink}" style="color: #1a365d;">${data.resetLink}</a>
    </p>
  `;

  return baseTemplate(content, 'Password Reset');
}

// ============ LEAVE TEMPLATES ============

export interface LeaveEmailData {
  staffName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  approverName?: string;
  portalUrl?: string;
}

export function leaveApprovalTemplate(data: LeaveEmailData): string {
  const content = `
    <h2 style="${styles.title}">🏖️ Leave Request Approved</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Great news! Your leave request has been <strong>approved</strong>.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Leave Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">From</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.startDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">To</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.endDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Total Days</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.totalDays} day(s)</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.approverName ? `<p style="${styles.paragraph}">Approved by: <strong>${data.approverName}</strong></p>` : ''}
    
    <p style="${styles.paragraph}">
      Please ensure a proper handover is completed before your leave begins. Have a wonderful time off!
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Leave Calendar</a>
    </p>
  `;

  return baseTemplate(content, 'Leave Request Approved');
}

export function leaveRejectedTemplate(data: LeaveEmailData & { reason?: string }): string {
  const content = `
    <h2 style="${styles.title}">Leave Request Update</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      We regret to inform you that your leave request could not be approved at this time.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Leave Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.leaveType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Requested Dates</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.startDate} - ${data.endDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusRejected}">Not Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.reason ? `
    <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #e53e3e;">Reason:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${data.reason}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      If you would like to discuss alternative dates or have any questions, please speak with your supervisor or HR.
    </p>
  `;

  return baseTemplate(content, 'Leave Request Status');
}

// ============ TRAINING TEMPLATES ============

export interface TrainingEmailData {
  staffName: string;
  programName: string;
  provider?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  notes?: string;
  portalUrl?: string;
}

export function trainingApprovalTemplate(data: TrainingEmailData): string {
  const content = `
    <h2 style="${styles.title}">📚 Training Request Approved</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Your training request has been <strong>approved</strong>. Details below:
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Program</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.programName}</td>
        </tr>
        ${data.provider ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Provider</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.provider}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Start Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.startDate}</td>
        </tr>
        ${data.endDate ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">End Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.endDate}</td>
        </tr>
        ` : ''}
        ${data.location ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Location</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.location}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    ${data.notes ? `
    <div style="background: #ebf4ff; border-left: 4px solid #1a365d; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #1a365d;">📝 Additional Notes:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${data.notes}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      Please make necessary arrangements with your team for coverage during the training period.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Details</a>
    </p>
  `;

  return baseTemplate(content, 'Training Approved');
}

// ============ TRANSFER TEMPLATES ============

export interface TransferEmailData {
  staffName: string;
  fromDepartment: string;
  toDepartment: string;
  effectiveDate: string;
  newManager?: string;
  newRole?: string;
  notes?: string;
  portalUrl?: string;
}

export function transferApprovalTemplate(data: TransferEmailData): string {
  const content = `
    <h2 style="${styles.title}">🔄 Transfer Request Approved</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      Your transfer request has been <strong>approved</strong>. Please review the details below:
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">From Department</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.fromDepartment}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">To Department</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; color: #38a169;">${data.toDepartment}</td>
        </tr>
        ${data.newRole ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">New Role</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.newRole}</td>
        </tr>
        ` : ''}
        ${data.newManager ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">New Manager</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.newManager}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Effective Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.effectiveDate}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      Please coordinate with your current and new departments for a smooth transition. HR will reach out with additional onboarding information for your new role.
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Details</a>
    </p>
  `;

  return baseTemplate(content, 'Transfer Approved');
}

// ============ CONTRACT TEMPLATES ============

export interface ContractEmailData {
  staffName: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  changes?: string;
  portalUrl?: string;
}

export function contractRenewalTemplate(data: ContractEmailData): string {
  const content = `
    <h2 style="${styles.title}">📋 Contract Renewal</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      We are pleased to inform you that your employment contract has been renewed.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Contract Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.contractType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">New Start Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.startDate}</td>
        </tr>
        ${data.endDate ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">New End Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.endDate}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Active</span></td>
        </tr>
      </table>
    </div>
    
    ${data.changes ? `
    <div style="background: #ebf4ff; border-left: 4px solid #1a365d; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #1a365d;">📝 Contract Updates:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${data.changes}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      Thank you for your continued dedication. We look forward to your continued contributions!
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.button}">View Contract</a>
    </p>
  `;

  return baseTemplate(content, 'Contract Renewal');
}

export function contractTerminationTemplate(data: { staffName: string; lastDay: string; reason?: string; notes?: string }): string {
  const content = `
    <h2 style="${styles.title}">Contract Termination Notice</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      This is to confirm that your employment with our organization will end on <strong>${data.lastDay}</strong>.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Last Working Day</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.lastDay}</td>
        </tr>
        ${data.reason ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.reason}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      Please ensure the following before your departure:
    </p>
    <ul style="color: #374151; font-size: 15px; line-height: 1.8;">
      <li>Complete all pending work and handover</li>
      <li>Return company property (laptop, access cards, etc.)</li>
      <li>Clear any outstanding loans or advances</li>
      <li>Schedule exit interview with HR</li>
    </ul>
    
    ${data.notes ? `<p style="${styles.paragraph}">${data.notes}</p>` : ''}
    
    <p style="${styles.paragraph}">
      We wish you all the best in your future endeavors. Thank you for your contributions to the team.
    </p>
  `;

  return baseTemplate(content, 'Contract Termination Notice');
}

// ============ SYSTEM TEMPLATES ============

export interface AnnouncementEmailData {
  staffName?: string;
  title: string;
  message: string;
  category?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function systemAnnouncementTemplate(data: AnnouncementEmailData): string {
  const content = `
    <h2 style="${styles.title}">📢 ${data.title}</h2>
    ${data.staffName ? `<p style="${styles.paragraph}">Dear ${data.staffName},</p>` : ''}
    
    <div style="background: linear-gradient(135deg, #ebf4ff, #e0e7ff); border-radius: 12px; padding: 24px; margin: 20px 0;">
      <p style="margin: 0; font-size: 15px; color: #1e293b; line-height: 1.7;">${data.message}</p>
    </div>
    
    ${data.category ? `
    <p style="font-size: 13px; color: #64748b;">
      Category: <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: 500;">${data.category}</span>
    </p>
    ` : ''}
    
    ${data.actionUrl && data.actionLabel ? `
    <p style="text-align: center;">
      <a href="${data.actionUrl}" style="${styles.button}">${data.actionLabel}</a>
    </p>
    ` : ''}
  `;

  return baseTemplate(content, data.title);
}

export function maintenanceNoticeTemplate(data: { startTime: string; endTime: string; affectedServices?: string[]; contactEmail?: string }): string {
  const content = `
    <h2 style="${styles.title}">🔧 Scheduled Maintenance Notice</h2>
    <p style="${styles.paragraph}">
      This is to notify you of scheduled maintenance on the Staff Portal.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Start Time</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.startTime}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">End Time</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${data.endTime}</td>
        </tr>
      </table>
    </div>
    
    ${data.affectedServices && data.affectedServices.length > 0 ? `
    <div style="background: #fffaf0; border-left: 4px solid #dd6b20; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #dd6b20;">⚠️ Affected Services:</strong>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #374151;">
        ${data.affectedServices.map(s => `<li>${s}</li>`).join('')}
      </ul>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      During this time, the portal may be temporarily unavailable. We apologize for any inconvenience.
    </p>
    
    ${data.contactEmail ? `
    <p style="font-size: 13px; color: #64748b;">
      For urgent matters, please contact: <a href="mailto:${data.contactEmail}" style="color: #1a365d;">${data.contactEmail}</a>
    </p>
    ` : ''}
  `;

  return baseTemplate(content, 'Scheduled Maintenance');
}

export function accountSecurityAlertTemplate(data: { staffName: string; eventType: string; eventTime: string; ipAddress?: string; location?: string; portalUrl?: string }): string {
  const content = `
    <h2 style="${styles.title}">🔐 Security Alert</h2>
    <p style="${styles.paragraph}">Dear ${data.staffName},</p>
    <p style="${styles.paragraph}">
      We detected a security-related event on your Staff Portal account:
    </p>
    
    <div style="background: #fff5f5; border: 1px solid #feb2b2; border-radius: 12px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; color: #742a2a;">Event Type</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; text-align: right; color: #e53e3e;">${data.eventType}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; color: #742a2a;">Time</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; text-align: right;">${data.eventTime}</td>
        </tr>
        ${data.ipAddress ? `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; color: #742a2a;">IP Address</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #feb2b2; font-weight: 600; text-align: right; font-family: monospace;">${data.ipAddress}</td>
        </tr>
        ` : ''}
        ${data.location ? `
        <tr>
          <td style="padding: 10px 0; color: #742a2a;">Location</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right;">${data.location}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      If this was you, no action is required. If you did not perform this action, please secure your account immediately:
    </p>
    
    <p style="text-align: center;">
      <a href="${data.portalUrl || '#'}" style="${styles.accentButton}">Secure My Account</a>
    </p>
    
    <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
      If you need assistance, contact IT support immediately.
    </p>
  `;

  return baseTemplate(content, 'Security Alert');
}

// ============ GRANT TEMPLATES ============

export interface GrantEmailData {
  staffName: string;
  grantId: string;
  amount: number;
  category: string;
  reason?: string;
  portalUrl?: string;
}

export function grantApplicationTemplate(firstName: string, grant: any): string {
  const content = `
    <h2 style="${styles.title}">Grant Application Received</h2>
    <p style="${styles.paragraph}">Dear ${firstName},</p>
    <p style="${styles.paragraph}">
      Thank you for submitting your grant application. We have received your request and it is currently under review.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Reference Number</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${grant.id}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Category</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${grant.category}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Amount Requested</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">$${grant.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusPending}">Pending Review</span></td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      You will receive a notification once your application has been reviewed. This typically takes 2-5 business days.
    </p>
  `;

  return baseTemplate(content, 'Grant Application Received');
}

export function grantApprovalTemplate(firstName: string, grant: any): string {
  const content = `
    <h2 style="${styles.title}">🎉 Grant Application Approved!</h2>
    <p style="${styles.paragraph}">Dear ${firstName},</p>
    <p style="${styles.paragraph}">
      Congratulations! Your grant application has been <strong>approved</strong>. The funds will be processed according to your organization's disbursement schedule.
    </p>
    
    <div style="${styles.infoBox}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Reference Number</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${grant.id}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Category</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right;">${grant.category}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Approved Amount</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: right; color: #38a169;">$${grant.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b;">Status</td>
          <td style="padding: 10px 0; text-align: right;"><span style="${styles.statusApproved}">Approved</span></td>
        </tr>
      </table>
    </div>
    
    <p style="${styles.paragraph}">
      Please log in to your Staff Portal to view the complete grant details and disbursement timeline.
    </p>
  `;

  return baseTemplate(content, 'Grant Approved');
}

export function grantRejectionTemplate(firstName: string, reason?: string): string {
  const content = `
    <h2 style="${styles.title}">Grant Application Update</h2>
    <p style="${styles.paragraph}">Dear ${firstName},</p>
    <p style="${styles.paragraph}">
      Thank you for your grant application. After careful review, we regret to inform you that your application has not been approved at this time.
    </p>
    
    ${reason ? `
    <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
      <strong style="color: #e53e3e;">Reason:</strong>
      <p style="margin: 8px 0 0; color: #374151;">${reason}</p>
    </div>
    ` : ''}
    
    <p style="${styles.paragraph}">
      If you have questions about this decision or would like to discuss your options, please contact the HR department.
    </p>
  `;

  return baseTemplate(content, 'Grant Application Status');
}
