import { InvoiceParserService } from '../../src/services/invoice-parser.service';
import PDFDocument from 'pdfkit';

// Do NOT mock pdf-parse here. We want to test real parsing performance.

describe('Performance: Invoice Parsing', () => {
  let service: InvoiceParserService;

  beforeAll(() => {
    service = new InvoiceParserService();
  });

  const generateInvoicePdf = (text: string): Promise<Buffer> => {
    return new Promise(resolve => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.text(text);
      doc.end();
    });
  };

  it('should parse 50 invoices within acceptable time', async () => {
    const iterations = 50;
    const invoiceText = `
      Invoice #INV-PERF-TEST
      Service Code: UHI-SERVICE
      Reference Code: LOAN-REF-999
      Total Due: 1,200.50
      Date: 2024-01-01
      Bill To: John Doe
    `;

    // Generate one PDF buffer to reuse (testing parsing speed, not generation speed)
    const pdfBuffer = await generateInvoicePdf(invoiceText);

    const start = performance.now();
    const promises = [];
    for (let i = 0; i < iterations; i++) {
      promises.push(service.parse(pdfBuffer));
    }

    await Promise.all(promises);
    const end = performance.now();
    const duration = end - start;

    console.log(`Parsed ${iterations} invoices in ${duration.toFixed(2)}ms`);
    console.log(`Average: ${(duration / iterations).toFixed(2)}ms per invoice`);

    // Real parsing is slower than mock.
    // Expect average to be under 200ms per invoice (conservative estimate for node)
    // Adjust based on actual run
    expect(duration / iterations).toBeLessThan(200);
  }, 30000); // Increase timeout
});
