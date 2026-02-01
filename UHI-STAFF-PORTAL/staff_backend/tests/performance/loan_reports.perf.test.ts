import request from 'supertest';
import app from '../../src/app';
import { performance } from 'perf_hooks';

describe('Performance: Loan Reports', () => {
  let authToken = 'mock-admin-token';

  it('should generate loan statistics report under 500ms', async () => {
    const start = performance.now();
    
    // Using a more realistic endpoint: Admin Loan Stats
    const res = await request(app)
      .get('/api/v1/finance/admin/loans/stats') 
      .set('Authorization', `Bearer ${authToken}`);

    const end = performance.now();
    const duration = end - start;

    console.log(`Loan Stats Report Time: ${duration.toFixed(2)}ms (Status: ${res.status})`);
    
    expect(duration).toBeLessThan(500);
  });

  it('should handle concurrent loan list requests', async () => {
    const requests = Array(20).fill(null).map(() => 
      request(app)
        .get('/api/v1/finance/loans')
        .set('Authorization', `Bearer ${authToken}`)
    );

    const start = performance.now();
    await Promise.all(requests);
    const end = performance.now();
    
    const totalTime = end - start;
    console.log(`20 Concurrent Loan List Requests Time: ${totalTime.toFixed(2)}ms`);
    
    expect(totalTime).toBeLessThan(2000); 
  });
});
