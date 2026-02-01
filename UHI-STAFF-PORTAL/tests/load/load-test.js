import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

/**
 * UHI Staff Portal - Load Testing Script
 * 
 * This script tests the performance and scalability of the UHI Staff Portal
 * under various load conditions.
 * 
 * Usage:
 * - Smoke test: k6 run --vus 1 --duration 1m load-test.js
 * - Load test: k6 run --vus 100 --duration 5m load-test.js
 * - Stress test: k6 run --vus 200 --duration 10m load-test.js
 * - Spike test: k6 run --stage 1m:10,1m:100,1m:10 load-test.js
 */

// Custom metrics
const loginErrors = new Rate('login_errors');
const apiErrors = new Rate('api_errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('request_count');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const STAFF_PORTAL_URL = __ENV.STAFF_PORTAL_URL || 'http://localhost:3001';
const ADMIN_PORTAL_URL = __ENV.ADMIN_PORTAL_URL || 'http://localhost:3002';

// Test configuration
export const options = {
    stages: [
        { duration: '2m', target: 10 },   // Ramp up to 10 users
        { duration: '5m', target: 50 },   // Stay at 50 users
        { duration: '5m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Stay at 100 users
        { duration: '2m', target: 0 },    // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
        http_req_failed: ['rate<0.05'],                  // Error rate under 5%
        login_errors: ['rate<0.01'],                     // Login error rate under 1%
        api_errors: ['rate<0.05'],                       // API error rate under 5%
    },
    ext: {
        loadimpact: {
            projectID: 3512345,
            name: 'UHI Staff Portal Load Test'
        }
    }
};

// Test data
const testUsers = [
    { email: 'staff1@uhi.org', password: 'password123' },
    { email: 'staff2@uhi.org', password: 'password123' },
    { email: 'admin@uhi.org', password: 'password123' },
];

let authToken = '';
let csrfToken = '';

// Setup function - runs once per VU
export function setup() {
    // Health check
    const healthCheck = http.get(`${BASE_URL}/health`);
    check(healthCheck, {
        'health check status is 200': (r) => r.status === 200,
    });

    return { baseUrl: BASE_URL };
}

// Main test function
export default function (data) {
    // Get CSRF token
    group('Get CSRF Token', () => {
        const csrfResponse = http.get(`${BASE_URL}/api/v1/csrf-token`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        check(csrfResponse, {
            'CSRF token retrieved': (r) => r.status === 200,
            'CSRF token present': (r) => r.json('csrfToken') !== undefined,
        });

        if (csrfResponse.status === 200) {
            csrfToken = csrfResponse.json('csrfToken');
        }
    });

    // Login test
    group('User Login', () => {
        const user = testUsers[Math.floor(Math.random() * testUsers.length)];

        const loginPayload = JSON.stringify({
            email: user.email,
            password: user.password,
        });

        const loginResponse = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
        });

        const loginSuccess = check(loginResponse, {
            'login status is 200': (r) => r.status === 200,
            'login returns token': (r) => r.json('token') !== undefined,
        });

        loginErrors.add(!loginSuccess);

        if (loginSuccess) {
            authToken = loginResponse.json('token');
        }

        responseTime.add(loginResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(1);

    // Dashboard access test
    group('Dashboard Access', () => {
        const dashboardResponse = http.get(`${BASE_URL}/api/v1/staff/dashboard`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const dashboardSuccess = check(dashboardResponse, {
            'dashboard status is 200': (r) => r.status === 200,
            'dashboard returns data': (r) => r.body.length > 0,
        });

        apiErrors.add(!dashboardSuccess);
        responseTime.add(dashboardResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(1);

    // Payroll records test
    group('Payroll Records', () => {
        const payrollResponse = http.get(`${BASE_URL}/api/v1/staff/payroll`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const payrollSuccess = check(payrollResponse, {
            'payroll status is 200': (r) => r.status === 200,
        });

        apiErrors.add(!payrollSuccess);
        responseTime.add(payrollResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(1);

    // Loan management test
    group('Loan Management', () => {
        const loansResponse = http.get(`${BASE_URL}/api/v1/finance/loans`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const loansSuccess = check(loansResponse, {
            'loans status is 200': (r) => r.status === 200,
        });

        apiErrors.add(!loansSuccess);
        responseTime.add(loansResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(1);

    // Applications test
    group('Applications', () => {
        const applicationsResponse = http.get(`${BASE_URL}/api/v1/applications`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const applicationsSuccess = check(applicationsResponse, {
            'applications status is 200': (r) => r.status === 200,
        });

        apiErrors.add(!applicationsSuccess);
        responseTime.add(applicationsResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(2);

    // Document download test
    group('Document Download', () => {
        const documentsResponse = http.get(`${BASE_URL}/api/v1/staff/documents`, {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        const documentsSuccess = check(documentsResponse, {
            'documents status is 200': (r) => r.status === 200,
        });

        apiErrors.add(!documentsSuccess);
        responseTime.add(documentsResponse.timings.duration);
        requestCount.add(1);
    });

    sleep(1);
}

// Teardown function - runs once at the end
export function teardown(data) {
    console.log('Load test completed');
}

// Handle summary
export function handleSummary(data) {
    return {
        'load-test-results.json': JSON.stringify(data, null, 2),
        stdout: textSummary(data, { indent: ' ', enableColors: true }),
    };
}

function textSummary(data, options) {
    const indent = options.indent || '';
    const enableColors = options.enableColors || false;

    let summary = '\n';
    summary += `${indent}Test Summary:\n`;
    summary += `${indent}  Total Requests: ${data.metrics.request_count.values.count}\n`;
    summary += `${indent}  Failed Requests: ${data.metrics.http_req_failed.values.rate * 100}%\n`;
    summary += `${indent}  Avg Response Time: ${data.metrics.http_req_duration.values.avg}ms\n`;
    summary += `${indent}  95th Percentile: ${data.metrics.http_req_duration.values['p(95)']}ms\n`;
    summary += `${indent}  99th Percentile: ${data.metrics.http_req_duration.values['p(99)']}ms\n`;
    summary += `${indent}  Login Error Rate: ${data.metrics.login_errors.values.rate * 100}%\n`;
    summary += `${indent}  API Error Rate: ${data.metrics.api_errors.values.rate * 100}%\n`;

    return summary;
}
