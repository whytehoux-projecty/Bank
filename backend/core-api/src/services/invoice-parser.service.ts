const pdfLib = require('pdf-parse');
const PDFParse = pdfLib.PDFParse;

export interface ParsedInvoice {
  invoiceNumber: string | null;
  amount: number | null;
  staffId: string | null;
  loanCode: string | null;
  qrString: string | null;
  serviceCode: string | null;
  accountCode: string | null;
  paymentPin: string | null;
  breakdown: {
    principal: number;
    tax: number;
    fee: number;
  };
}

export class InvoiceParserService {
  async parse(buffer: Buffer): Promise<ParsedInvoice> {
    try {
      const parser = new PDFParse(new Uint8Array(buffer));
      const data = await parser.getText();
      const text = data.text;
      return this.extractData(text);
    } catch (error) {
      console.error('PDF Parse Error:', error);
      throw new Error('Failed to parse PDF invoice content.');
    }
  }

  private extractData(text: string): ParsedInvoice {
    const result: ParsedInvoice = {
      invoiceNumber: null,
      amount: null,
      staffId: null,
      loanCode: null,
      qrString: null,
      serviceCode: null,
      accountCode: null,
      paymentPin: null,
      breakdown: { principal: 0, tax: 0, fee: 0 },
    };

    // Invoice Number
    // Matches "Invoice #INV-..." or just "INV-..."
    const invMatch = text.match(/Invoice\s*#\s*([A-Z0-9-]+)/i) || text.match(/(INV-[A-Z0-9-]+)/);
    if (invMatch && invMatch[1]) result.invoiceNumber = invMatch[1];

    // Amount (Total Due)
    // Matches "Total Due: $500.00" or similar
    const amountMatch = text.match(/Total\s*Due[^0-9]*([\d,]+\.?\d{2})/i);
    if (amountMatch && amountMatch[1]) {
      result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Principal
    const principalMatch = text.match(/Principal\s*Amount[^0-9]*([\d,]+\.?\d{2})/i);
    if (principalMatch && principalMatch[1])
      result.breakdown.principal = parseFloat(principalMatch[1].replace(/,/g, ''));

    // Service Code
    const svcMatch = text.match(/Service\s*Code:\s*([A-Z0-9-]+)/i);
    if (svcMatch && svcMatch[1]) result.serviceCode = svcMatch[1];

    // Account Code
    const accMatch = text.match(/Reference\s*Code:\s*([A-Z0-9-/]+)/i);
    if (accMatch && accMatch[1]) result.accountCode = accMatch[1];

    // Loan Code
    const loanMatch = text.match(/LOAN-[0-9]+/);
    if (loanMatch) result.loanCode = loanMatch[0];

    // Payment PIN
    const pinMatch = text.match(/Payment\s*Reference\s*PIN:\s*([A-Z0-9]+)/i);
    if (pinMatch && pinMatch[1]) result.paymentPin = pinMatch[1];

    return result;
  }
}
