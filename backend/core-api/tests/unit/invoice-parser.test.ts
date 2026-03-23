import { InvoiceParserService } from '../../src/services/invoice-parser.service';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock pdf-parse
jest.mock('pdf-parse', () => {
  return {
    PDFParse: jest.fn().mockImplementation((buffer: any) => {
      return {
        getText: async () => {
          const content = Buffer.from(buffer).toString();

          if (content.includes('INVALID_PDF')) {
            throw new Error('Invalid PDF');
          }

          if (content.includes('MOCK_INVOICE')) {
            return {
              text: `
          Invoice #INV-TEST-2026
          Service Code: UHI-2134
          Reference Code: G/L/2026/LOAN-123
          
          Payment Reference PIN: ABC123XYZ
          
          Principal Amount: 500.00
          Tax: 0.00
          Fee: 0.00
          
          Total Due: 500.00
          LOAN-123
        `,
            };
          }

          if (content.includes('SIMPLE')) {
            return {
              text: `
         Invoice #INV-SIMPLE
         Total Due: 100.00
       `,
            };
          }

          if (content.includes('ALTERNATIVE_INV')) {
            return {
              text: `
         Here is your bill: INV-ALT-2026
         Total Due: 50.00
       `,
            };
          }

          if (content.includes('EMPTY')) {
            return { text: 'Just some random text with no fields.' };
          }

          return { text: '' };
        },
      };
    }),
  };
});

describe('InvoiceParserService', () => {
  let service: InvoiceParserService;

  beforeEach(() => {
    service = new InvoiceParserService();
  });

  it('should parse valid invoice PDF content correctly', async () => {
    const mockBuffer = Buffer.from('MOCK_INVOICE_CONTENT');
    const result = await service.parse(mockBuffer);

    expect(result.invoiceNumber).toBe('INV-TEST-2026');
    expect(result.serviceCode).toBe('UHI-2134');
    expect(result.accountCode).toBe('G/L/2026/LOAN-123');
    expect(result.loanCode).toBe('LOAN-123');
    expect(result.paymentPin).toBe('ABC123XYZ');
    expect(result.amount).toBe(500.0);
    expect(result.breakdown.principal).toBe(500.0);
  });

  it('should handle missing optional fields gracefully', async () => {
    const result = await service.parse(Buffer.from('SIMPLE'));

    expect(result.invoiceNumber).toBe('INV-SIMPLE');
    expect(result.amount).toBe(100.0);
    expect(result.serviceCode).toBeNull();
  });

  it('should match alternative invoice format (INV- without Invoice #)', async () => {
    const result = await service.parse(Buffer.from('ALTERNATIVE_INV'));
    expect(result.invoiceNumber).toBe('INV-ALT-2026');
  });

  it('should return nulls when no fields match', async () => {
    const result = await service.parse(Buffer.from('EMPTY'));
    expect(result.invoiceNumber).toBeNull();
    expect(result.amount).toBeNull();
    expect(result.serviceCode).toBeNull();
  });

  it('should throw error for corrupted or invalid PDF', async () => {
    const mockBuffer = Buffer.from('INVALID_PDF');
    await expect(service.parse(mockBuffer)).rejects.toThrow('Failed to parse PDF invoice content');
  });
});
