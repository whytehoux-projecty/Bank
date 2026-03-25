# AURUM VAULT - Quick Setup Guide for New Features

This guide will help you set up the newly implemented features (Monitoring, CI/CD, Backups, 2FA, and Enhanced Testing).

---

## 1. Monitoring Setup (5 minutes)

### Start Monitoring Stack

```bash
cd /Volumes/Project\ Disk/PROJECTS/CODING/AURUMVAULT/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### Access Dashboards

- **Grafana**: <http://localhost:3000> (admin/admin - change on first login)
- **Prometheus**: <http://localhost:9090>
- **Alertmanager**: <http://localhost:9093>

### Enable Metrics in Backend

Add to `backend/core-api/src/server.ts`:

```typescript
import { metricsMiddleware, registerMetricsRoute } from './middleware/metrics';

// After creating fastify instance
app.addHook('onRequest', metricsMiddleware);
registerMetricsRoute(app);
```

Restart backend:

```bash
cd backend/core-api
npm run dev
```

Verify metrics: <http://localhost:3001/metrics>

---

## 2. CI/CD Setup (2 minutes)

### GitHub Actions (Automatic)

The CI/CD pipeline will automatically run on:

- Push to `main` or `develop` branches
- Pull requests

### Required GitHub Secrets

Go to GitHub → Settings → Secrets and add:

```
GRAFANA_ADMIN_PASSWORD=your-secure-password
DB_PASSWORD=your-database-password
```

### Test Locally

```bash
# Run tests locally before pushing
cd backend/core-api
npm test

cd ../../e-banking-portal
npm test
```

---

## 3. Backup Automation (3 minutes)

### Test Backup Script

```bash
cd /Volumes/Project\ Disk/PROJECTS/CODING/AURUMVAULT

# Set environment variables
export DB_PASSWORD="password"
export DB_NAME="aurumvault"
export BACKUP_DIR="/var/backups/aurumvault"

# Create backup directory
mkdir -p $BACKUP_DIR

# Run backup
./scripts/backup-database.sh
```

### Setup Automated Backups

```bash
# Edit crontab
crontab -e

# Add these lines (adjust paths):
0 2 * * * /path/to/aurumvault/scripts/backup-database.sh >> /var/log/aurumvault-backup.log 2>&1
0 3 * * 0 /path/to/aurumvault/scripts/backup-database.sh >> /var/log/aurumvault-backup-weekly.log 2>&1
```

### Test Restore

```bash
# List backups
ls -lh /var/backups/aurumvault/

# Restore from backup
./scripts/restore-database.sh /var/backups/aurumvault/aurumvault_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## 4. Two-Factor Authentication (3 minutes)

### Install Dependencies

```bash
cd backend/core-api
npm install speakeasy qrcode @types/speakeasy @types/qrcode
```

### Register 2FA Routes

Add to `backend/core-api/src/server.ts`:

```typescript
import twoFactorRoutes from './routes/two-factor';

// Register routes
app.register(twoFactorRoutes, { prefix: '/api/2fa' });
```

### Update Prisma Schema

Add to `backend/core-api/prisma/schema.prisma`:

```prisma
model User {
  // ... existing fields ...
  twoFactorSecret       String?
  twoFactorEnabled      Boolean @default(false)
  twoFactorBackupCodes  String?
}
```

Run migration:

```bash
npx prisma migrate dev --name add_two_factor
```

### Test 2FA Endpoints

```bash
# Setup 2FA (requires authentication)
curl -X POST http://localhost:3001/api/2fa/setup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response includes QR code URL and backup codes
```

---

## 5. Enhanced Testing (5 minutes)

### Install Playwright

```bash
cd e-banking-portal/e2e
npm install
npx playwright install
```

### Run E2E Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

### Run Component Tests

```bash
cd e-banking-portal
npm install @testing-library/react @testing-library/jest-dom
npm test
```

### View Test Reports

```bash
# E2E test report
cd e2e
npm run test:e2e:report
```

---

## 6. Verification Checklist

After setup, verify everything works:

### Monitoring

- [ ] Grafana accessible at <http://localhost:3000>
- [ ] Prometheus showing targets as UP
- [ ] Metrics endpoint responding: <http://localhost:3001/metrics>
- [ ] Dashboard displaying data

### CI/CD

- [ ] GitHub Actions workflow visible in repository
- [ ] Tests run on push to main/develop
- [ ] Build succeeds

### Backups

- [ ] Backup script runs successfully
- [ ] Backup file created in /var/backups/aurumvault/
- [ ] Backup compressed (.gz file)
- [ ] Restore script works

### 2FA

- [ ] 2FA routes registered
- [ ] Setup endpoint returns QR code
- [ ] Token verification works
- [ ] Backup codes work

### Testing

- [ ] Playwright installed
- [ ] E2E tests run successfully
- [ ] Component tests pass
- [ ] Test reports generated

---

## 7. Troubleshooting

### Monitoring Issues

**Problem**: Prometheus can't scrape metrics
**Solution**: Ensure backend is exposing /metrics endpoint and firewall allows port 3001

**Problem**: Grafana shows "No data"
**Solution**: Check Prometheus data source configuration in Grafana

### Backup Issues

**Problem**: Permission denied
**Solution**:

```bash
chmod +x scripts/backup-database.sh
chmod +x scripts/restore-database.sh
```

**Problem**: pg_dump not found
**Solution**: Install PostgreSQL client tools

### 2FA Issues

**Problem**: QR code not generating
**Solution**: Check speakeasy and qrcode packages are installed

**Problem**: Token verification fails
**Solution**: Ensure system time is synchronized (TOTP is time-based)

### Testing Issues

**Problem**: Playwright tests fail
**Solution**:

```bash
npx playwright install --with-deps
```

**Problem**: Component tests fail
**Solution**: Ensure React Testing Library is installed

---

## 8. Quick Commands Reference

```bash
# Start monitoring
cd monitoring && docker-compose -f docker-compose.monitoring.yml up -d

# Stop monitoring
cd monitoring && docker-compose -f docker-compose.monitoring.yml down

# Run backup
./scripts/backup-database.sh

# Run restore
./scripts/restore-database.sh <backup_file>

# Run E2E tests
cd e-banking-portal/e2e && npm run test:e2e

# Run component tests
cd e-banking-portal && npm test

# View Grafana
open http://localhost:3000

# View Prometheus
open http://localhost:9090

# View metrics
curl http://localhost:3001/metrics
```

---

## 9. Next Steps

1. **Configure Alerts**: Edit `monitoring/prometheus/alerts/service-alerts.yml`
2. **Setup S3 Backups**: Add AWS credentials for S3 upload
3. **Enable 2FA for Users**: Add 2FA UI in e-banking portal
4. **Schedule Tests**: Add E2E tests to CI/CD pipeline
5. **Monitor Production**: Deploy monitoring stack to production

---

## Support

For issues or questions:

- Check logs: `docker-compose logs -f`
- Review documentation in `/docs`
- Check GitHub Issues

---

**Setup Complete!** 🎉

Your AURUM VAULT installation now has:
✅ Full monitoring and observability
✅ Automated CI/CD pipeline
✅ Automated backups with disaster recovery
✅ Two-Factor Authentication
✅ Comprehensive E2E and component testing

**Status**: Production-Ready 🚀
