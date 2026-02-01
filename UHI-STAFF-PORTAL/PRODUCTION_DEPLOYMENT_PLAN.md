# UHI Staff Portal - Production Deployment Plan

**Version**: 1.0.0  
**Date**: February 1, 2026  
**Environment**: Production  
**Deployment Type**: Blue-Green Deployment

---

## 📋 Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] Production server provisioned (minimum 8GB RAM, 4 CPU cores, 100GB SSD)
- [ ] Docker and Docker Compose installed
- [ ] PostgreSQL 15 configured (or RDS instance ready)
- [ ] Redis 7 configured (or ElastiCache instance ready)
- [ ] AWS S3 bucket created for documents
- [ ] AWS Secrets Manager configured
- [ ] SSL certificates obtained and configured
- [ ] Domain DNS configured
- [ ] Firewall rules configured (ports 80, 443, 22)
- [ ] Backup storage configured (S3 bucket for backups)

### Security Requirements

- [ ] AWS Secrets Manager secrets created
- [ ] JWT secrets generated (minimum 64 characters)
- [ ] Stripe API keys configured
- [ ] SMTP credentials configured
- [ ] SSH keys for deployment configured
- [ ] GitHub Actions secrets configured
- [ ] SSL/TLS certificates installed
- [ ] Security groups/firewall rules reviewed

### Monitoring & Logging

- [ ] Grafana dashboards configured
- [ ] Prometheus alerts configured
- [ ] Sentry error tracking configured
- [ ] Log aggregation configured (CloudWatch/Datadog)
- [ ] Uptime monitoring configured
- [ ] Slack/Email notifications configured

### Testing & Validation

- [ ] All unit tests passing (80% coverage target)
- [ ] Integration tests passing
- [ ] Load testing completed (500 concurrent users)
- [ ] Security scan completed (no critical vulnerabilities)
- [ ] Staging deployment tested
- [ ] Database migrations tested
- [ ] Backup and restore tested
- [ ] Disaster recovery plan tested

---

## 🚀 Deployment Timeline

### Phase 1: Pre-Deployment (Day -7 to Day -1)

**Day -7: Infrastructure Setup**

- Provision production servers
- Configure networking and security groups
- Set up database instances (PostgreSQL, Redis)
- Configure AWS S3 buckets
- Install monitoring stack (Grafana, Prometheus)

**Day -5: Security Configuration**

- Create AWS Secrets Manager secrets
- Generate and store all API keys
- Configure SSL certificates
- Set up firewall rules
- Configure backup automation

**Day -3: Staging Deployment**

- Deploy to staging environment
- Run full test suite
- Perform load testing
- Conduct security audit
- Test backup and restore procedures

**Day -1: Final Preparation**

- Code freeze
- Final security review
- Backup current production data (if applicable)
- Prepare rollback plan
- Schedule deployment window
- Notify stakeholders

### Phase 2: Deployment Day (Day 0)

**Time: 02:00 AM - 06:00 AM (Low Traffic Window)**

**02:00 - 02:30: Pre-Deployment**

```bash
# 1. SSH into production server
ssh deploy@production-server

# 2. Create deployment directory
mkdir -p /opt/uhi-staff-portal
cd /opt/uhi-staff-portal

# 3. Clone repository
git clone https://github.com/whytehoux-projecty/WSAAS.git .
git checkout main

# 4. Configure environment
cp .env.docker.example .env
nano .env  # Update with production values

# 5. Verify configuration
./scripts/test-docker-deployment.sh staging
```

**02:30 - 03:00: Database Setup**

```bash
# 1. Start database services
docker-compose up -d postgres redis

# 2. Wait for services to be healthy
docker-compose ps

# 3. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 4. Seed initial data (if needed)
docker-compose exec backend npx prisma db seed

# 5. Verify database
docker-compose exec postgres psql -U uhi_user -d uhi_staff_portal -c "\dt"
```

**03:00 - 03:30: Application Deployment**

```bash
# 1. Build and start all services
docker-compose up -d --build

# 2. Verify all containers are running
docker-compose ps

# 3. Check logs for errors
docker-compose logs --tail=100

# 4. Run health checks
curl http://localhost:3000/health
curl http://localhost:3001
curl http://localhost:3002
```

**03:30 - 04:00: Monitoring Setup**

```bash
# 1. Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# 2. Access Grafana
# URL: http://production-server:3003
# Login: admin / <configured-password>

# 3. Verify Prometheus targets
# URL: http://production-server:9090/targets

# 4. Configure alerts
# Check Alertmanager: http://production-server:9093
```

**04:00 - 04:30: SSL & Reverse Proxy**

```bash
# 1. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/uhi-staff-portal

# 2. Enable site
sudo ln -s /etc/nginx/sites-available/uhi-staff-portal /etc/nginx/sites-enabled/

# 3. Test Nginx configuration
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Verify SSL
curl https://portal.uhi.org/health
```

**04:30 - 05:00: Verification & Testing**

```bash
# 1. Run automated tests
cd /opt/uhi-staff-portal
./scripts/test-docker-deployment.sh production

# 2. Test critical user flows
# - User login
# - Dashboard access
# - Payroll viewing
# - Document download
# - Application submission

# 3. Verify monitoring
# - Check Grafana dashboards
# - Verify Prometheus metrics
# - Test alert notifications

# 4. Performance check
# - Run load test
k6 run --vus 50 --duration 5m tests/load/load-test.js
```

**05:00 - 05:30: Backup Configuration**

```bash
# 1. Test backup script
./scripts/backup-database.sh

# 2. Verify backup in S3
aws s3 ls s3://uhi-backups/backups/

# 3. Configure cron job
crontab -e
# Add: 0 2 * * * /opt/uhi-staff-portal/scripts/backup-database.sh >> /var/log/uhi-backup.log 2>&1

# 4. Test restore procedure
./scripts/restore-database.sh <latest-backup>
```

**05:30 - 06:00: Go-Live**

```bash
# 1. Update DNS to point to production server
# (if not already done)

# 2. Monitor application logs
docker-compose logs -f

# 3. Monitor Grafana dashboards

# 4. Notify stakeholders
# Send deployment success notification

# 5. Monitor for 30 minutes
# Watch for any errors or issues
```

### Phase 3: Post-Deployment (Day 0 - Day 7)

**Day 0 (Deployment Day)**

- Monitor application continuously for 24 hours
- Watch for errors in Sentry
- Monitor performance metrics in Grafana
- Be ready for immediate rollback if needed

**Day 1-2: Close Monitoring**

- Review logs daily
- Monitor user feedback
- Check performance metrics
- Verify backup completion
- Test disaster recovery procedures

**Day 3-7: Stabilization**

- Continue monitoring
- Address any issues
- Optimize performance if needed
- Update documentation
- Conduct post-deployment review

---

## 🔄 Rollback Plan

### Immediate Rollback (< 1 hour)

If critical issues are detected:

```bash
# 1. Stop current deployment
docker-compose down

# 2. Restore from pre-deployment backup
./scripts/restore-database.sh pre_deploy_<timestamp>.sql.gz

# 3. Revert to previous version
git checkout <previous-version-tag>

# 4. Restart services
docker-compose up -d

# 5. Verify rollback
./scripts/test-docker-deployment.sh production

# 6. Notify stakeholders
```

### Rollback Triggers

- Critical security vulnerability discovered
- Data corruption detected
- Service unavailability > 5 minutes
- Error rate > 10%
- Database migration failure
- Performance degradation > 50%

---

## 📊 Success Criteria

### Technical Metrics

- [ ] All services running and healthy
- [ ] Response time p95 < 500ms
- [ ] Error rate < 1%
- [ ] Database queries p95 < 100ms
- [ ] Zero critical security vulnerabilities
- [ ] Backup completion rate 100%
- [ ] Uptime > 99.9%

### Business Metrics

- [ ] User login success rate > 99%
- [ ] Document download success rate > 99%
- [ ] Payment processing success rate > 99%
- [ ] Application submission success rate > 99%

### Operational Metrics

- [ ] Monitoring dashboards operational
- [ ] Alerts configured and tested
- [ ] Backup automation working
- [ ] Log aggregation working
- [ ] Documentation updated

---

## 👥 Deployment Team

### Roles & Responsibilities

**Deployment Lead**

- Overall coordination
- Go/No-go decision
- Stakeholder communication

**DevOps Engineer**

- Infrastructure setup
- Docker deployment
- Monitoring configuration

**Backend Developer**

- Database migrations
- API verification
- Bug fixes

**Frontend Developer**

- UI verification
- User flow testing
- Frontend bug fixes

**QA Engineer**

- Test execution
- Verification testing
- Issue reporting

**Security Engineer**

- Security verification
- SSL configuration
- Secrets management

---

## 📞 Emergency Contacts

**Deployment Lead**: [Name] - [Phone] - [Email]  
**DevOps Engineer**: [Name] - [Phone] - [Email]  
**Backend Developer**: [Name] - [Phone] - [Email]  
**Database Admin**: [Name] - [Phone] - [Email]  
**Security Engineer**: [Name] - [Phone] - [Email]

**Escalation Path**:

1. Deployment Lead
2. Technical Director
3. CTO

---

## 📝 Post-Deployment Tasks

### Immediate (Day 0-1)

- [ ] Monitor application for 24 hours
- [ ] Document any issues encountered
- [ ] Update runbook with lessons learned
- [ ] Send deployment summary to stakeholders

### Short-term (Week 1)

- [ ] Conduct post-deployment review meeting
- [ ] Update documentation
- [ ] Optimize performance based on metrics
- [ ] Address any minor issues
- [ ] Plan next iteration

### Long-term (Month 1)

- [ ] Review monitoring and alerting effectiveness
- [ ] Analyze user feedback
- [ ] Plan feature enhancements
- [ ] Conduct disaster recovery drill
- [ ] Update capacity planning

---

## 🔐 Security Checklist

- [ ] All secrets stored in AWS Secrets Manager
- [ ] SSL/TLS certificates valid and configured
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Security headers configured (Helmet.js)
- [ ] Database connections encrypted
- [ ] API authentication working
- [ ] 2FA enabled for admin accounts
- [ ] Audit logging enabled
- [ ] Security monitoring alerts configured

---

## 📈 Monitoring Checklist

- [ ] Grafana dashboards accessible
- [ ] Prometheus scraping all targets
- [ ] Alertmanager configured
- [ ] Sentry error tracking active
- [ ] Log aggregation working
- [ ] Uptime monitoring configured
- [ ] Performance metrics collecting
- [ ] Database metrics visible
- [ ] Container metrics visible
- [ ] Alert notifications working

---

## ✅ Final Go-Live Approval

**Approved By**:

- [ ] Technical Lead: _________________ Date: _______
- [ ] Security Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______
- [ ] CTO: __________________________ Date: _______

**Deployment Window**: February 8, 2026, 02:00 AM - 06:00 AM UTC

**Status**: READY FOR DEPLOYMENT

---

**Document Version**: 1.0.0  
**Last Updated**: February 1, 2026  
**Next Review**: February 8, 2026
