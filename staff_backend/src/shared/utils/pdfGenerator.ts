import PDFDocument from "pdfkit";

interface PayslipData {
  user: {
    first_name: string;
    last_name: string;
    staff_id: string;
    email: string;
  };
  payroll: {
    period_month: number;
    period_year: number;
    basic_salary: number | string;
    allowances: number | string;
    deductions: number | string;
    net_pay: number | string;
    currency: string;
    payment_date: Date | null;
  };
  organization: {
    name: string;
    address: string;
    logo?: Buffer;
  };
}

interface LoanHistoryData {
  user: {
    first_name: string;
    last_name: string;
    staff_id: string;
  };
  loan: {
    id: string;
    amount: unknown;
    balance: unknown;
    currency: string;
    status: string;
  };
  payments: Array<{
    created_at: string | Date;
    payment_reference: string;
    payment_method: string;
    status: string;
    amount: unknown;
  }>;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatMoney = (amount: number | string, currency: string): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(num);
};

const formatDate = (date: Date | null): string => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

export const generatePayslipPDF = async (
  data: PayslipData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { user, payroll, organization } = data;
    const periodName = `${MONTHS[payroll.period_month - 1]} ${payroll.period_year}`;

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(organization.name, { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(organization.address, { align: "center" });

    doc.moveDown(2);

    // Title
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#0066CC")
      .text("PAYSLIP", { align: "center" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#000")
      .text(periodName, { align: "center" });

    doc.moveDown(2);

    // Divider
    doc
      .strokeColor("#ccc")
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1);

    // Employee Details Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Employee Details");

    doc.moveDown(0.5);

    const detailsY = doc.y;

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666")
      .text("Name:", 50, detailsY)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(`${user.first_name} ${user.last_name}`, 150, detailsY);

    doc
      .font("Helvetica")
      .fillColor("#666")
      .text("Staff ID:", 300, detailsY)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(user.staff_id, 400, detailsY);

    doc
      .font("Helvetica")
      .fillColor("#666")
      .text("Email:", 50, detailsY + 20)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(user.email, 150, detailsY + 20);

    doc
      .font("Helvetica")
      .fillColor("#666")
      .text("Payment Date:", 300, detailsY + 20)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(formatDate(payroll.payment_date), 400, detailsY + 20);

    doc.y = detailsY + 60;
    doc.moveDown(1);

    // Divider
    doc.strokeColor("#ccc").moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(1);

    // Earnings Section
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#333").text("Earnings");

    doc.moveDown(0.5);

    // Earnings table
    const earningsY = doc.y;
    const tableWidth = 495;

    // Table header
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#fff")
      .rect(50, earningsY, tableWidth, 25)
      .fill("#0066CC");

    doc
      .fillColor("#fff")
      .text("Description", 60, earningsY + 7)
      .text("Amount", 360, earningsY + 7);

    // Table rows
    let rowY = earningsY + 25;

    // Basic Salary
    doc.rect(50, rowY, tableWidth, 25).fill("#f9f9f9").stroke("#ddd");
    doc
      .fillColor("#000")
      .font("Helvetica")
      .text("Basic Salary", 60, rowY + 7)
      .text(formatMoney(payroll.basic_salary, payroll.currency), 360, rowY + 7);
    rowY += 25;

    // Allowances
    doc.rect(50, rowY, tableWidth, 25).fill("#fff").stroke("#ddd");
    doc
      .fillColor("#000")
      .text("Allowances", 60, rowY + 7)
      .text(formatMoney(payroll.allowances, payroll.currency), 360, rowY + 7);
    rowY += 25;

    // Gross total
    const grossPay =
      (typeof payroll.basic_salary === "string"
        ? parseFloat(payroll.basic_salary)
        : payroll.basic_salary) +
      (typeof payroll.allowances === "string"
        ? parseFloat(payroll.allowances)
        : payroll.allowances);

    doc.rect(50, rowY, tableWidth, 25).fill("#e8f4fd").stroke("#0066CC");
    doc
      .font("Helvetica-Bold")
      .fillColor("#0066CC")
      .text("Gross Pay", 60, rowY + 7)
      .text(formatMoney(grossPay, payroll.currency), 360, rowY + 7);
    rowY += 35;

    doc.y = rowY;

    // Deductions Section
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#333")
      .text("Deductions");

    doc.moveDown(0.5);

    // Deductions table
    const deductionsY = doc.y;

    // Table header
    doc.rect(50, deductionsY, tableWidth, 25).fill("#cc3300");
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor("#fff")
      .text("Description", 60, deductionsY + 7)
      .text("Amount", 360, deductionsY + 7);

    rowY = deductionsY + 25;

    // Total Deductions
    doc.rect(50, rowY, tableWidth, 25).fill("#fff").stroke("#ddd");
    doc
      .fillColor("#000")
      .font("Helvetica")
      .text("Total Deductions", 60, rowY + 7)
      .text(formatMoney(payroll.deductions, payroll.currency), 360, rowY + 7);
    rowY += 35;

    doc.y = rowY;

    // Net Pay Section
    doc.moveDown(1);

    const netPayY = doc.y;
    doc.rect(50, netPayY, tableWidth, 40).fill("#0066CC");

    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor("#fff")
      .text("NET PAY", 60, netPayY + 12)
      .fontSize(16)
      .text(formatMoney(payroll.net_pay, payroll.currency), 360, netPayY + 10);

    doc.y = netPayY + 60;

    // Footer
    doc.moveDown(3);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999")
      .text(
        "This is a computer-generated document. No signature is required.",
        { align: "center" },
      );

    doc.moveDown(0.5);

    doc.text(`Generated on ${formatDate(new Date())}`, { align: "center" });

    doc.moveDown(0.5);

    doc.text(
      `© ${new Date().getFullYear()} ${organization.name}. All rights reserved.`,
      { align: "center" },
    );

    // Finalize
    doc.end();
  });
};

export const generateLoanHistoryPDF = async (
  data: LoanHistoryData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { user, loan, payments } = data;

    // Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Loan History Report", { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Generated on ${new Date().toLocaleDateString()}`, {
        align: "center",
      });
    doc.moveDown(2);

    // Loan Details
    doc.fontSize(14).font("Helvetica-Bold").text("Loan Details");
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Reference: ${loan.id}`);
    doc.text(`Staff: ${user.first_name} ${user.last_name} (${user.staff_id})`);
    doc.text(
      `Principal Amount: ${formatMoney(String(loan.amount), loan.currency)}`,
    );
    doc.text(
      `Outstanding Balance: ${formatMoney(String(loan.balance), loan.currency)}`,
    );
    doc.text(`Status: ${loan.status.toUpperCase()}`);
    doc.moveDown(2);

    // Payments Table
    doc.fontSize(14).font("Helvetica-Bold").text("Payment History");
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemCodeX = 50;
    const descriptionX = 150;
    const quantityX = 280;
    const priceX = 370;
    const amountX = 450;

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text("Date", itemCodeX, tableTop);
    doc.text("Reference", descriptionX, tableTop);
    doc.text("Method", quantityX, tableTop);
    doc.text("Status", priceX, tableTop);
    doc.text("Amount", amountX, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    let y = tableTop + 25;
    doc.font("Helvetica");

    payments.forEach((payment) => {
      const date = new Date(payment.created_at).toLocaleDateString();
      doc.text(date, itemCodeX, y);
      doc.text(payment.payment_reference.substring(0, 15), descriptionX, y);
      doc.text(payment.payment_method, quantityX, y);
      doc.text(payment.status, priceX, y);
      doc.text(formatMoney(String(payment.amount), loan.currency), amountX, y);
      y += 20;

      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });

    doc.end();
  });
};

export default generatePayslipPDF;
