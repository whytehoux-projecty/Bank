
import { InvoiceParserService } from '../../backend/core-api/src/services/invoice-parser.service';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

// Mock pdf-parse
jest.mock('pdf-parse', () => {
  return jest.fn().mockImplementation(async () => ({
    text: 'Invoice #INV-PERF Total Due $100.00'
  }));
});

describe('Performance Tests', () => {
  const parser = new InvoiceParserService();

  it('should parse 1000 invoices within acceptable time limit', async () => {
    const iterations = 1000;
    const buffer = Buffer.from('mock pdf content');
    
    const start = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      await parser.parse(buffer);
    }
    
    const end = performance.now();
    const duration = end - start;
    const avgTime = duration / iterations;
    
    console.log(`Parsed ${iterations} invoices in ${duration.toFixed(2)}ms (Avg: ${avgTime.toFixed(2)}ms/invoice)`);
    
    // Expect average parsing time to be under 10ms (mocked)
    expect(avgTime).toBeLessThan(10);
  });
});
