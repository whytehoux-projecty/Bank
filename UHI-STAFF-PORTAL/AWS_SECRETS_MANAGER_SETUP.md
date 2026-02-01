# AWS Secrets Manager Setup Guide

**Purpose**: Configure AWS Secrets Manager for secure secrets management in production

---

## 📋 Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- IAM role/user with SecretsManager permissions

---

## 🔐 Step 1: Create IAM Policy

Create a policy for Secrets Manager access:

```bash
# Create policy file
cat > secrets-manager-policy.json <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecrets"
            ],
            "Resource": "arn:aws:secretsmanager:*:*:secret:uhi-staff-portal/*"
        }
    ]
}
EOF

# Create the policy
aws iam create-policy \
    --policy-name UHIStaffPortalSecretsReadPolicy \
    --policy-document file://secrets-manager-policy.json
```

---

## 🔑 Step 2: Create Secrets

### Production Secrets

```bash
# Create production secrets
aws secretsmanager create-secret \
    --name uhi-staff-portal/production \
    --description "UHI Staff Portal Production Secrets" \
    --secret-string file://production-secrets.json \
    --region us-east-1
```

**production-secrets.json**:

```json
{
  "database": {
    "url": "postgresql://uhi_user:SECURE_PASSWORD@rds-endpoint:5432/uhi_staff_portal",
    "password": "SECURE_DATABASE_PASSWORD"
  },
  "redis": {
    "url": "redis://:SECURE_PASSWORD@elasticache-endpoint:6379",
    "password": "SECURE_REDIS_PASSWORD"
  },
  "jwt": {
    "secret": "GENERATE_64_CHAR_SECRET_HERE",
    "refreshSecret": "GENERATE_64_CHAR_REFRESH_SECRET_HERE"
  },
  "stripe": {
    "secretKey": "sk_live_YOUR_STRIPE_SECRET_KEY",
    "webhookSecret": "whsec_YOUR_WEBHOOK_SECRET"
  },
  "aws": {
    "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
    "region": "us-east-1",
    "s3Bucket": "uhi-staff-portal-documents-prod"
  },
  "smtp": {
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "noreply@uhi.org",
    "password": "YOUR_SMTP_PASSWORD"
  },
  "sentry": {
    "dsn": "https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID"
  }
}
```

### Staging Secrets

```bash
# Create staging secrets
aws secretsmanager create-secret \
    --name uhi-staff-portal/staging \
    --description "UHI Staff Portal Staging Secrets" \
    --secret-string file://staging-secrets.json \
    --region us-east-1
```

---

## 🔄 Step 3: Enable Secret Rotation (Optional)

```bash
# Enable automatic rotation for database password
aws secretsmanager rotate-secret \
    --secret-id uhi-staff-portal/production \
    --rotation-lambda-arn arn:aws:lambda:us-east-1:ACCOUNT_ID:function:SecretsManagerRotation \
    --rotation-rules AutomaticallyAfterDays=30
```

---

## 👤 Step 4: Configure IAM Role for EC2/ECS

### For EC2 Instances

```bash
# Create IAM role
aws iam create-role \
    --role-name UHIStaffPortalEC2Role \
    --assume-role-policy-document file://ec2-trust-policy.json

# Attach policy
aws iam attach-role-policy \
    --role-name UHIStaffPortalEC2Role \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/UHIStaffPortalSecretsReadPolicy

# Create instance profile
aws iam create-instance-profile \
    --instance-profile-name UHIStaffPortalEC2Profile

# Add role to instance profile
aws iam add-role-to-instance-profile \
    --instance-profile-name UHIStaffPortalEC2Profile \
    --role-name UHIStaffPortalEC2Role
```

**ec2-trust-policy.json**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### For ECS Tasks

```bash
# Create ECS task execution role
aws iam create-role \
    --role-name UHIStaffPortalECSTaskRole \
    --assume-role-policy-document file://ecs-trust-policy.json

# Attach policies
aws iam attach-role-policy \
    --role-name UHIStaffPortalECSTaskRole \
    --policy-arn arn:aws:iam::ACCOUNT_ID:policy/UHIStaffPortalSecretsReadPolicy

aws iam attach-role-policy \
    --role-name UHIStaffPortalECSTaskRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

---

## 🔧 Step 5: Update Application Configuration

### Environment Variables

Add to `.env` or Docker Compose:

```bash
# Enable AWS Secrets Manager
USE_AWS_SECRETS=true
AWS_SECRETS_REGION=us-east-1
AWS_SECRET_NAME=uhi-staff-portal/production

# AWS Credentials (if not using IAM role)
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
```

### Docker Compose Update

```yaml
services:
  backend:
    environment:
      - USE_AWS_SECRETS=true
      - AWS_SECRETS_REGION=us-east-1
      - AWS_SECRET_NAME=uhi-staff-portal/production
    # If using IAM role, no need for AWS credentials
```

---

## 🧪 Step 6: Test Secrets Retrieval

```bash
# Test retrieving secret
aws secretsmanager get-secret-value \
    --secret-id uhi-staff-portal/production \
    --region us-east-1 \
    --query SecretString \
    --output text | jq .

# Test from application
docker-compose exec backend node -e "
const { secretsManager } = require('./dist/config/secrets');
secretsManager.getApplicationSecrets()
  .then(secrets => console.log('Secrets loaded successfully'))
  .catch(err => console.error('Error:', err));
"
```

---

## 🔐 Step 7: Security Best Practices

### 1. Use Resource-Based Policies

```bash
# Add resource policy to secret
aws secretsmanager put-resource-policy \
    --secret-id uhi-staff-portal/production \
    --resource-policy file://secret-resource-policy.json
```

**secret-resource-policy.json**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::ACCOUNT_ID:role/UHIStaffPortalEC2Role"
      },
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "*"
    }
  ]
}
```

### 2. Enable CloudTrail Logging

```bash
# Verify CloudTrail is logging Secrets Manager events
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=ResourceType,AttributeValue=AWS::SecretsManager::Secret \
    --max-results 10
```

### 3. Set Up Alerts

Create CloudWatch alarm for unauthorized access attempts:

```bash
aws cloudwatch put-metric-alarm \
    --alarm-name UHI-SecretsManager-UnauthorizedAccess \
    --alarm-description "Alert on unauthorized Secrets Manager access" \
    --metric-name UnauthorizedAPICallsCount \
    --namespace AWS/SecretsManager \
    --statistic Sum \
    --period 300 \
    --evaluation-periods 1 \
    --threshold 1 \
    --comparison-operator GreaterThanThreshold
```

---

## 📊 Step 8: Monitor Secrets Usage

### CloudWatch Metrics

```bash
# View secret access metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/SecretsManager \
    --metric-name SecretValueRetrievals \
    --dimensions Name=SecretId,Value=uhi-staff-portal/production \
    --start-time 2026-02-01T00:00:00Z \
    --end-time 2026-02-01T23:59:59Z \
    --period 3600 \
    --statistics Sum
```

### Audit Logs

```bash
# Query CloudTrail for Secrets Manager events
aws cloudtrail lookup-events \
    --lookup-attributes AttributeKey=EventName,AttributeValue=GetSecretValue \
    --start-time 2026-02-01T00:00:00Z \
    --max-results 50
```

---

## 🔄 Step 9: Secret Rotation Setup

### Create Rotation Lambda

```python
# rotation-lambda.py
import boto3
import json

def lambda_handler(event, context):
    secret_id = event['SecretId']
    token = event['ClientRequestToken']
    step = event['Step']
    
    secrets_client = boto3.client('secretsmanager')
    
    if step == "createSecret":
        # Generate new secret
        new_secret = generate_new_secret()
        secrets_client.put_secret_value(
            SecretId=secret_id,
            ClientRequestToken=token,
            SecretString=json.dumps(new_secret),
            VersionStages=['AWSPENDING']
        )
    
    elif step == "setSecret":
        # Update application with new secret
        pass
    
    elif step == "testSecret":
        # Test new secret
        pass
    
    elif step == "finishSecret":
        # Finalize rotation
        secrets_client.update_secret_version_stage(
            SecretId=secret_id,
            VersionStage='AWSCURRENT',
            MoveToVersionId=token
        )
```

---

## 📝 Troubleshooting

### Issue: Access Denied

```bash
# Check IAM permissions
aws iam get-role-policy \
    --role-name UHIStaffPortalEC2Role \
    --policy-name SecretsManagerAccess

# Verify instance profile
aws ec2 describe-instances \
    --instance-ids i-1234567890abcdef0 \
    --query 'Reservations[0].Instances[0].IamInstanceProfile'
```

### Issue: Secret Not Found

```bash
# List all secrets
aws secretsmanager list-secrets \
    --filters Key=name,Values=uhi-staff-portal

# Describe specific secret
aws secretsmanager describe-secret \
    --secret-id uhi-staff-portal/production
```

### Issue: Rotation Failed

```bash
# Check rotation status
aws secretsmanager describe-secret \
    --secret-id uhi-staff-portal/production \
    --query 'RotationEnabled'

# View rotation Lambda logs
aws logs tail /aws/lambda/SecretsManagerRotation --follow
```

---

## ✅ Verification Checklist

- [ ] Secrets created in AWS Secrets Manager
- [ ] IAM policies configured correctly
- [ ] EC2/ECS roles have appropriate permissions
- [ ] Application can retrieve secrets
- [ ] Secrets rotation configured (if applicable)
- [ ] CloudWatch alarms set up
- [ ] CloudTrail logging enabled
- [ ] Resource policies applied
- [ ] Backup secrets stored securely
- [ ] Documentation updated

---

## 💰 Cost Estimation

**AWS Secrets Manager Pricing** (us-east-1):

- $0.40 per secret per month
- $0.05 per 10,000 API calls

**Estimated Monthly Cost**:

- 2 secrets (production + staging): $0.80
- ~100,000 API calls: $0.50
- **Total**: ~$1.30/month

---

**Document Version**: 1.0.0  
**Last Updated**: February 1, 2026  
**Next Review**: After production deployment
