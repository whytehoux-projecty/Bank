/**
 * K6 Load Testing Script for Aurum Vault Core API
 * 
 * This script tests the performance of critical API endpoints
 * under various load conditions.
 * 
 * Installation:
 *   brew install k6  (macOS)
 *   or download from https://k6.io/
 * 
 * Usage:
 *   k6 run load-test.js
 * 
 * Custom options:
 *   k6 run --vus 50 --duration 30s load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const accountsDuration = new Trend('accounts_duration');
const transactionsDuration = new Trend('transactions_duration');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 20 },  // Ramp up to 20 users
        { duration: '1m', target: 50 },   // Ramp up to 50 users
        { duration: '2m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 100 }, // Spike to 100 users
        { duration: '1m', target: 100 },  // Stay at 100 users
        { duration: '30s', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
        errors: ['rate<0.05'],            // Custom error rate should be less than 5%
    },
};

// Base URL - change this to your API URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Test data
const TEST_USER = {
    email: 'test@example.com',
    password: 'TestPassword123!',
};

/**
 * Setup function - runs once before all tests
 */
export function setup() {
    console.log('🚀 Starting load test for Aurum Vault Core API');
    console.log(`📍 Base URL: ${BASE_URL}`);

    // Health check
    const healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
        'health check successful': (r) => r.status === 200,
    });

    return { baseUrl: BASE_URL };
}

/**
 * Main test function - runs for each virtual user
 */
export default function (data) {
    // Test 1: Health Check
    testHealthCheck();
    sleep(1);

    // Test 2: Root endpoint
    testRootEndpoint();
    sleep(1);

    // Test 3: Authentication flow
    const token = testAuthenticationFlow();
    sleep(1);

    if (token) {
        // Test 4: Get user accounts
        testGetAccounts(token);
        sleep(1);

        // Test 5: Get transactions
        testGetTransactions(token);
        sleep(1);

        // Test 6: Get KYC status
        testGetKycStatus(token);
        sleep(1);
    }

    // Random sleep between iterations
    sleep(Math.random() * 3);
}

/**
 * Test health check endpoint
 */
function testHealthCheck() {
    const res = http.get(`${BASE_URL}/health`);

    const success = check(res, {
        'health check status is 200': (r) => r.status === 200,
        'health check has database status': (r) => r.json('database') !== undefined,
    });

    errorRate.add(!success);
}

/**
 * Test root endpoint
 */
function testRootEndpoint() {
    const res = http.get(`${BASE_URL}/`);

    const success = check(res, {
        'root endpoint status is 200': (r) => r.status === 200,
        'root endpoint has success field': (r) => r.json('success') === true,
    });

    errorRate.add(!success);
}

/**
 * Test authentication flow
 * @returns {string|null} JWT token or null if failed
 */
function testAuthenticationFlow() {
    const loginStart = new Date();

    const res = http.post(
        `${BASE_URL}/api/auth/login`,
        JSON.stringify(TEST_USER),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );

    loginDuration.add(new Date() - loginStart);

    const success = check(res, {
        'login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'login response has token or error': (r) => {
            const body = r.json();
            return body.token !== undefined || body.error !== undefined;
        },
    });

    errorRate.add(!success);

    // Return token if login successful
    if (res.status === 200) {
        const body = res.json();
        return body.token || body.data?.token;
    }

    return null;
}

/**
 * Test get accounts endpoint
 */
function testGetAccounts(token) {
    const start = new Date();

    const res = http.get(`${BASE_URL}/api/accounts`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    accountsDuration.add(new Date() - start);

    const success = check(res, {
        'get accounts status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'get accounts response is valid': (r) => {
            if (r.status === 200) {
                const body = r.json();
                return Array.isArray(body) || Array.isArray(body.data);
            }
            return true;
        },
    });

    errorRate.add(!success);
}

/**
 * Test get transactions endpoint
 */
function testGetTransactions(token) {
    const start = new Date();

    const res = http.get(`${BASE_URL}/api/transactions`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    transactionsDuration.add(new Date() - start);

    const success = check(res, {
        'get transactions status is 200 or 401': (r) => r.status === 200 || r.status === 401,
        'get transactions response is valid': (r) => {
            if (r.status === 200) {
                const body = r.json();
                return Array.isArray(body) || Array.isArray(body.data) || body.transactions !== undefined;
            }
            return true;
        },
    });

    errorRate.add(!success);
}

/**
 * Test get KYC status endpoint
 */
function testGetKycStatus(token) {
    const res = http.get(`${BASE_URL}/api/kyc/status`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const success = check(res, {
        'get KYC status is 200 or 401 or 404': (r) =>
            r.status === 200 || r.status === 401 || r.status === 404,
    });

    errorRate.add(!success);
}

/**
 * Teardown function - runs once after all tests
 */
export function teardown(data) {
    console.log('✅ Load test completed');
}

/**
 * Handle summary - custom summary output
 */
export function handleSummary(data) {
    return {
        'stdout': textSummary(data, { indent: ' ', enableColors: true }),
        'load-test-results.json': JSON.stringify(data),
    };
}

/**
 * Generate text summary
 */
function textSummary(data, options = {}) {
    const indent = options.indent || '';
    const enableColors = options.enableColors || false;

    let summary = '\n';
    summary += `${indent}📊 Load Test Summary\n`;
    summary += `${indent}${'='.repeat(50)}\n\n`;

    // Metrics
    const metrics = data.metrics;

    if (metrics.http_req_duration) {
        summary += `${indent}⏱️  HTTP Request Duration:\n`;
        summary += `${indent}   Average: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
        summary += `${indent}   Median:  ${metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
        summary += `${indent}   p95:     ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
        summary += `${indent}   p99:     ${metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;
    }

    if (metrics.http_reqs) {
        summary += `${indent}📈 Total Requests: ${metrics.http_reqs.values.count}\n`;
        summary += `${indent}   Rate: ${metrics.http_reqs.values.rate.toFixed(2)} req/s\n\n`;
    }

    if (metrics.http_req_failed) {
        const failRate = (metrics.http_req_failed.values.rate * 100).toFixed(2);
        summary += `${indent}❌ Failed Requests: ${failRate}%\n\n`;
    }

    if (metrics.errors) {
        const errorRateValue = (metrics.errors.values.rate * 100).toFixed(2);
        summary += `${indent}⚠️  Error Rate: ${errorRateValue}%\n\n`;
    }

    summary += `${indent}${'='.repeat(50)}\n`;

    return summary;
}
