# Application Performance Monitoring (APM) Setup Guide

This guide provides instructions for setting up APM to monitor application performance, track errors, and optimize the Aurum Vault Core API.

---

## 🎯 Recommended APM Solutions

### Option 1: New Relic (Recommended)

- **Pros:** Comprehensive, easy setup, great UI
- **Cons:** Can be expensive at scale
- **Best for:** Production applications with budget

### Option 2: Datadog

- **Pros:** Excellent infrastructure monitoring
- **Cons:** Complex pricing
- **Best for:** Large-scale deployments

### Option 3: Sentry (Error Tracking)

- **Pros:** Free tier, excellent error tracking
- **Cons:** Limited APM features
- **Best for:** Startups, error monitoring focus

### Option 4: Elastic APM (Open Source)

- **Pros:** Free, self-hosted, powerful
- **Cons:** Requires setup and maintenance
- **Best for:** Teams with DevOps resources

---

## 🚀 Quick Setup: Sentry (Recommended for Start)

### 1. Install Sentry

```bash
cd backend/core-api
npm install @sentry/node @sentry/profiling-node
```

### 2. Create Sentry Configuration

Create `src/config/sentry.ts`:

```typescript
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Profiling
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new ProfilingIntegration(),
      ],
      
      // Error filtering
      beforeSend(event, hint) {
        // Don't send 404 errors
        if (event.exception?.values?.[0]?.value?.includes('404')) {
          return null;
        }
        return event;
      },
      
      // Release tracking
      release: process.env.npm_package_version,
    });

    console.log('✅ Sentry APM initialized');
  } else {
    console.log('ℹ️  Sentry APM disabled (no SENTRY_DSN)');
  }
}

export { Sentry };
```

### 3. Integrate with Server

Update `src/server.ts`:

```typescript
import { initializeSentry, Sentry } from './config/sentry';

// Initialize Sentry FIRST (before any other imports)
initializeSentry();

// ... rest of imports

export const setupApp = async () => {
  try {
    // ... existing setup

    // Add Sentry error handler (must be before other error handlers)
    fastify.setErrorHandler((error, request, reply) => {
      // Capture error in Sentry
      Sentry.captureException(error, {
        extra: {
          url: request.url,
          method: request.method,
          headers: request.headers,
          query: request.query,
          params: request.params,
        },
      });

      // Send response
      reply.status(error.statusCode || 500).send({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred' 
            : error.message,
        },
      });
    });

    // ... rest of setup
  } catch (error) {
    Sentry.captureException(error);
    throw error;
  }
};
```

### 4. Add to Environment Variables

```env
# .env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 5. Custom Performance Tracking

```typescript
import { Sentry } from './config/sentry';

// Track custom transactions
export async function processPayment(data: any) {
  const transaction = Sentry.startTransaction({
    op: 'payment',
    name: 'Process Payment',
  });

  try {
    // Your payment logic
    const result = await paymentService.process(data);
    
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    Sentry.captureException(error);
    throw error;
  } finally {
    transaction.finish();
  }
}
```

---

## 📊 Custom Metrics Tracking

### Create Metrics Service

Create `src/services/metricsService.ts`:

```typescript
import { Sentry } from '../config/sentry';

export class MetricsService {
  /**
   * Track API endpoint performance
   */
  static trackEndpoint(
    method: string,
    path: string,
    duration: number,
    statusCode: number
  ) {
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${method} ${path}`,
      level: 'info',
      data: {
        duration,
        statusCode,
      },
    });

    // Track slow endpoints
    if (duration > 1000) {
      Sentry.captureMessage(`Slow endpoint: ${method} ${path}`, {
        level: 'warning',
        extra: {
          duration,
          statusCode,
        },
      });
    }
  }

  /**
   * Track database query performance
   */
  static trackQuery(
    model: string,
    action: string,
    duration: number
  ) {
    if (duration > 1000) {
      Sentry.captureMessage(`Slow query: ${model}.${action}`, {
        level: 'warning',
        extra: {
          model,
          action,
          duration,
        },
      });
    }
  }

  /**
   * Track cache hit/miss
   */
  static trackCache(key: string, hit: boolean) {
    Sentry.addBreadcrumb({
      category: 'cache',
      message: hit ? 'Cache hit' : 'Cache miss',
      level: 'info',
      data: { key },
    });
  }

  /**
   * Track business metrics
   */
  static trackBusinessMetric(
    metric: string,
    value: number,
    tags?: Record<string, string>
  ) {
    Sentry.addBreadcrumb({
      category: 'business',
      message: metric,
      level: 'info',
      data: {
        value,
        ...tags,
      },
    });
  }
}
```

### Add Fastify Plugin for Request Tracking

Create `src/plugins/metrics.ts`:

```typescript
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { MetricsService } from '../services/metricsService';

async function metricsPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    (request as any).startTime = Date.now();
  });

  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const duration = Date.now() - ((request as any).startTime || 0);
    
    MetricsService.trackEndpoint(
      request.method,
      request.url,
      duration,
      reply.statusCode
    );
  });
}

export default fp(metricsPlugin);
```

Register in `src/server.ts`:

```typescript
import metricsPlugin from './plugins/metrics';

// In setupApp()
await fastify.register(metricsPlugin);
```

---

## 🔍 Performance Monitoring Dashboard

### Key Metrics to Track

1. **Response Time Metrics**
   - Average response time
   - p50, p95, p99 response times
   - Slowest endpoints

2. **Error Metrics**
   - Error rate
   - Error types
   - Error frequency by endpoint

3. **Database Metrics**
   - Query count
   - Slow queries
   - Connection pool usage

4. **Cache Metrics**
   - Hit rate
   - Miss rate
   - Cache size

5. **Business Metrics**
   - Transactions per minute
   - Active users
   - API calls per endpoint

---

## 📈 Alerting Rules

### Recommended Alerts

```typescript
// Example alert configuration (pseudo-code)
const alerts = {
  // High error rate
  errorRate: {
    condition: 'error_rate > 5%',
    window: '5 minutes',
    action: 'notify_team',
  },
  
  // Slow response time
  slowResponse: {
    condition: 'p95_response_time > 1000ms',
    window: '10 minutes',
    action: 'notify_team',
  },
  
  // High database load
  dbLoad: {
    condition: 'slow_queries > 10',
    window: '5 minutes',
    action: 'notify_team',
  },
  
  // Cache issues
  cacheDown: {
    condition: 'cache_hit_rate < 50%',
    window: '15 minutes',
    action: 'notify_team',
  },
};
```

---

## 🎯 Performance Benchmarks

### Target Metrics

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Average Response Time | < 200ms | > 500ms |
| p95 Response Time | < 500ms | > 1000ms |
| p99 Response Time | < 1000ms | > 2000ms |
| Error Rate | < 0.1% | > 1% |
| Database Query Time | < 100ms | > 500ms |
| Cache Hit Rate | > 80% | < 50% |
| Uptime | > 99.9% | < 99% |

---

## 🔧 Alternative: Simple Custom Monitoring

If you don't want to use external APM, create a simple monitoring system:

### Create `src/services/monitoringService.ts`

```typescript
import fs from 'fs';
import path from 'path';

interface Metric {
  timestamp: number;
  type: string;
  value: number;
  tags?: Record<string, string>;
}

export class MonitoringService {
  private static metrics: Metric[] = [];
  private static logFile = path.join(__dirname, '../../logs/metrics.log');

  static track(type: string, value: number, tags?: Record<string, string>) {
    const metric: Metric = {
      timestamp: Date.now(),
      type,
      value,
      tags,
    };

    this.metrics.push(metric);

    // Write to log file
    fs.appendFileSync(
      this.logFile,
      JSON.stringify(metric) + '\n',
      { flag: 'a' }
    );

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }

  static getMetrics(type?: string, since?: number) {
    let filtered = this.metrics;

    if (type) {
      filtered = filtered.filter(m => m.type === type);
    }

    if (since) {
      filtered = filtered.filter(m => m.timestamp >= since);
    }

    return filtered;
  }

  static getStats(type: string, since?: number) {
    const metrics = this.getMetrics(type, since);
    const values = metrics.map(m => m.value);

    if (values.length === 0) {
      return null;
    }

    values.sort((a, b) => a - b);

    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: values[0],
      max: values[values.length - 1],
      p50: values[Math.floor(values.length * 0.5)],
      p95: values[Math.floor(values.length * 0.95)],
      p99: values[Math.floor(values.length * 0.99)],
    };
  }
}
```

---

## ✅ APM Setup Checklist

- [ ] APM solution selected
- [ ] Sentry/APM SDK installed
- [ ] Configuration file created
- [ ] Environment variables set
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Custom metrics implemented
- [ ] Alerting rules configured
- [ ] Dashboard created
- [ ] Team notifications set up

---

## 📚 Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [New Relic Node.js Agent](https://docs.newrelic.com/docs/apm/agents/nodejs-agent/)
- [Datadog APM](https://docs.datadoghq.com/tracing/)
- [Elastic APM](https://www.elastic.co/guide/en/apm/get-started/current/index.html)

---

**Last Updated:** 2026-02-03  
**Status:** Ready for implementation  
**Recommended:** Start with Sentry for error tracking, upgrade to full APM as needed
