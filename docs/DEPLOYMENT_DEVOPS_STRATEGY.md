# Deployment & DevOps Strategy
## NovaBank → Aurum Vault Transformation

### 🚀 Overview

This document outlines the comprehensive deployment and DevOps strategy for transforming NovaBank into the enterprise-grade Aurum Vault banking platform. The strategy focuses on establishing a robust, secure, and scalable infrastructure with modern CI/CD pipelines, ensuring high availability, disaster recovery, and operational excellence for a premium banking experience.

---

## 🏛️ Infrastructure Architecture

### Cloud Architecture

```text
AURUM VAULT CLOUD ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ MULTI-REGION DEPLOYMENT                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Primary region: AWS EU-West-1 (Ireland)                  │
│ ▶ Secondary region: AWS EU-Central-1 (Frankfurt)           │
│ ▶ Tertiary region: AWS US-East-1 (N. Virginia)             │
│ ▶ Global CDN distribution                                  │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ HIGH AVAILABILITY DESIGN                                   │
├─────────────────────────────────────────────────────────────┤
│ ▶ Multi-AZ deployments                                     │
│ ▶ Auto-scaling groups                                      │
│ ▶ Load balancing (Application and Network)                 │
│ ▶ Database replication and failover                        │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ DISASTER RECOVERY                                          │
├─────────────────────────────────────────────────────────────┤
│ ▶ Cross-region replication                                 │
│ ▶ Point-in-time recovery                                   │
│ ▶ Regular DR testing                                       │
│ ▶ Recovery time objective (RTO): 15 minutes                │
└─────────────────────────────────────────────────────────────┘
```

| Component | Description | Implementation |
|---------|-------------|----------------|
| **Multi-Region** | Distributed deployment across multiple AWS regions | Primary workloads in EU with global distribution |
| **High Availability** | Redundant infrastructure with no single points of failure | Multi-AZ deployments with auto-scaling |
| **Disaster Recovery** | Comprehensive backup and recovery capabilities | Cross-region replication with automated failover |
| **Global CDN** | Content delivery network for static assets | AWS CloudFront with origin shields |
| **Network Architecture** | Secure network design with defense in depth | VPC design with public, private, and isolated subnets |

### Container Orchestration

```text
CONTAINER ORCHESTRATION

┌─────────────────────────────────────────────────────────────┐
│ KUBERNETES CLUSTER                                         │
├─────────────────────────────────────────────────────────────┤
│ ▶ Amazon EKS managed service                               │
│ ▶ Multi-AZ node groups                                     │
│ ▶ Spot and On-Demand instance mix                          │
│ ▶ Cluster autoscaling                                      │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVICE MESH                                               │
├─────────────────────────────────────────────────────────────┤
│ ▶ Istio for service-to-service communication               │
│ ▶ Traffic management and routing                           │
│ ▶ Observability and telemetry                              │
│ ▶ Security and policy enforcement                          │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ CONTAINER REGISTRY                                         │
├─────────────────────────────────────────────────────────────┤
│ ▶ Amazon ECR for container images                          │
│ ▶ Image scanning and vulnerability detection               │
│ ▶ Immutable tags                                           │
│ ▶ Cross-region replication                                 │
└─────────────────────────────────────────────────────────────┘
```

| Component | Description | Implementation |
|---------|-------------|----------------|
| **Kubernetes** | Container orchestration platform | Amazon EKS with managed node groups |
| **Service Mesh** | Advanced networking for microservices | Istio with mTLS encryption |
| **Container Registry** | Secure storage for container images | Amazon ECR with vulnerability scanning |
| **Helm Charts** | Package management for Kubernetes | Standardized application deployment templates |
| **Operators** | Kubernetes extensions for complex operations | Custom operators for banking-specific workloads |

---

## 🔄 CI/CD Pipeline

### Pipeline Architecture

```text
CI/CD PIPELINE ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ SOURCE CONTROL                                             │
├─────────────────────────────────────────────────────────────┤
│ ▶ GitHub Enterprise                                        │
│ ▶ Branch protection rules                                  │
│ ▶ Required code reviews                                    │
│ ▶ Signed commits                                           │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ CONTINUOUS INTEGRATION                                     │
├─────────────────────────────────────────────────────────────┤
│ ▶ GitHub Actions workflows                                 │
│ ▶ Automated testing                                        │
│ ▶ Code quality checks                                      │
│ ▶ Security scanning                                        │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ CONTINUOUS DELIVERY                                        │
├─────────────────────────────────────────────────────────────┤
│ ▶ ArgoCD for GitOps deployment                             │
│ ▶ Progressive delivery with canary releases                │
│ ▶ Automated rollbacks                                      │
│ ▶ Environment promotion                                    │
└─────────────────────────────────────────────────────────────┘
```

| Component | Description | Implementation |
|---------|-------------|----------------|
| **Source Control** | Version control system for code | GitHub Enterprise with branch protection |
| **CI System** | Automated build and test platform | GitHub Actions with matrix builds |
| **CD System** | Automated deployment platform | ArgoCD with GitOps workflow |
| **Artifact Management** | Storage for build artifacts | GitHub Packages and Amazon ECR |
| **Secret Management** | Secure handling of sensitive data | AWS Secrets Manager and SOPS |

### Deployment Workflow

```text
DEPLOYMENT WORKFLOW

┌─────────────────────────────────────────────────────────────┐
│ DEVELOPMENT                                                │
├─────────────────────────────────────────────────────────────┤
│ ▶ Feature branch creation                                  │
│ ▶ Local development and testing                            │
│ ▶ Pull request submission                                  │
│ ▶ Automated PR checks                                      │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ INTEGRATION                                                │
├─────────────────────────────────────────────────────────────┤
│ ▶ Merge to main branch                                     │
│ ▶ CI pipeline execution                                    │
│ ▶ Artifact generation                                      │
│ ▶ Deployment to development environment                    │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ STAGING                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Promotion to staging environment                         │
│ ▶ Integration testing                                      │
│ ▶ Performance testing                                      │
│ ▶ Security validation                                      │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ PRODUCTION                                                 │
├─────────────────────────────────────────────────────────────┤
│ ▶ Approval workflow                                        │
│ ▶ Canary deployment                                        │
│ ▶ Progressive traffic shifting                             │
│ ▶ Automated rollback on metrics deviation                  │
└─────────────────────────────────────────────────────────────┘
```

| Stage | Description | Implementation |
|---------|-------------|----------------|
| **Development** | Initial code creation and testing | Feature branches with PR workflow |
| **Integration** | Merging and testing code changes | Automated testing in development environment |
| **Staging** | Pre-production validation | Full integration testing in staging environment |
| **Production** | Live deployment | Canary releases with progressive traffic shifting |
| **Rollback** | Recovery from failed deployments | Automated metric-based rollback triggers |

---

## 🔍 Monitoring & Observability

### Observability Stack

```text
OBSERVABILITY ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ METRICS                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Prometheus for metrics collection                        │
│ ▶ Thanos for long-term storage                             │
│ ▶ Grafana for visualization                                │
│ ▶ AlertManager for alerting                                │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LOGGING                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Fluent Bit for collection                                │
│ ▶ Elasticsearch for storage and indexing                   │
│ ▶ Kibana for visualization                                 │
│ ▶ Log retention policies                                   │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ TRACING                                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ OpenTelemetry for instrumentation                        │
│ ▶ Jaeger for distributed tracing                           │
│ ▶ Trace sampling strategies                                │
│ ▶ Service dependency mapping                               │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SYNTHETIC MONITORING                                       │
├─────────────────────────────────────────────────────────────┤
│ ▶ End-to-end transaction monitoring                        │
│ ▶ Global performance monitoring                            │
│ ▶ User journey simulation                                  │
│ ▶ SLA compliance tracking                                  │
└─────────────────────────────────────────────────────────────┘
```

| Component | Description | Implementation |
|---------|-------------|----------------|
| **Metrics** | Numerical time-series data | Prometheus with Thanos for long-term storage |
| **Logging** | Structured application logs | EFK stack with retention policies |
| **Tracing** | Distributed request tracking | OpenTelemetry with Jaeger backend |
| **Dashboards** | Visualization of telemetry data | Grafana with custom banking dashboards |
| **Alerting** | Notification system for issues | AlertManager with escalation policies |

### Key Monitoring Metrics

| Category | Metrics | Thresholds |
|---------|-------------|----------------|
| **Application Performance** | Response time, throughput, error rate | P95 < 200ms, Error rate < 0.1% |
| **Infrastructure** | CPU, memory, disk, network utilization | CPU < 70%, Memory < 80% |
| **Database** | Query performance, connection pool, replication lag | Query time < 50ms, Lag < 10s |
| **User Experience** | Page load time, API response time, transaction completion | Page load < 2s, Transaction < 5s |
| **Business Metrics** | Login rate, transaction volume, active users | Compared to historical baselines |

---

## 🔒 Security & Compliance

### Security Controls

```text
SECURITY ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE SECURITY                                    │
├─────────────────────────────────────────────────────────────┤
│ ▶ Network segmentation                                     │
│ ▶ WAF and DDoS protection                                  │
│ ▶ Encryption in transit and at rest                        │
│ ▶ Vulnerability management                                 │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION SECURITY                                       │
├─────────────────────────────────────────────────────────────┤
│ ▶ SAST and DAST integration                                │
│ ▶ Dependency scanning                                      │
│ ▶ Container security                                       │
│ ▶ Runtime application protection                           │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ IDENTITY & ACCESS                                          │
├─────────────────────────────────────────────────────────────┤
│ ▶ IAM with least privilege                                 │
│ ▶ MFA for all access                                       │
│ ▶ Secrets management                                       │
│ ▶ Privileged access management                             │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ SECURITY OPERATIONS                                        │
├─────────────────────────────────────────────────────────────┤
│ ▶ Security monitoring                                      │
│ ▶ Threat detection                                         │
│ ▶ Incident response                                        │
│ ▶ Security automation                                      │
└─────────────────────────────────────────────────────────────┘
```

| Control | Description | Implementation |
|---------|-------------|----------------|
| **Network Security** | Protection of network infrastructure | VPC design with security groups and NACLs |
| **Application Security** | Protection of application code | SAST/DAST in CI/CD pipeline |
| **Data Protection** | Safeguarding sensitive information | Encryption, tokenization, and masking |
| **Identity & Access** | Control of system access | IAM with least privilege and MFA |
| **Security Monitoring** | Detection of security events | SIEM with banking-specific use cases |

### Compliance Framework

```text
COMPLIANCE FRAMEWORK

┌─────────────────────────────────────────────────────────────┐
│ REGULATORY COMPLIANCE                                      │
├─────────────────────────────────────────────────────────────┤
│ ▶ PSD2 and Open Banking                                    │
│ ▶ GDPR data protection                                     │
│ ▶ AML and KYC requirements                                 │
│ ▶ Financial regulatory reporting                           │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ INDUSTRY STANDARDS                                         │
├─────────────────────────────────────────────────────────────┤
│ ▶ ISO 27001 Information Security                           │
│ ▶ PCI DSS for payment data                                 │
│ ▶ NIST Cybersecurity Framework                             │
│ ▶ Cloud Security Alliance (CSA)                            │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ COMPLIANCE AUTOMATION                                      │
├─────────────────────────────────────────────────────────────┤
│ ▶ Continuous compliance monitoring                         │
│ ▶ Automated evidence collection                            │
│ ▶ Compliance as code                                       │
│ ▶ Audit trail generation                                   │
└─────────────────────────────────────────────────────────────┘
```

| Framework | Description | Implementation |
|---------|-------------|----------------|
| **Regulatory** | Compliance with banking regulations | PSD2, GDPR, AML, KYC controls |
| **Industry Standards** | Adherence to security best practices | ISO 27001, PCI DSS, NIST CSF |
| **Internal Policies** | Organization-specific requirements | Policy as code with automated enforcement |
| **Audit & Reporting** | Verification of compliance | Automated evidence collection and reporting |
| **Continuous Compliance** | Ongoing compliance monitoring | Real-time compliance dashboards |

---

## 🛠️ Infrastructure as Code

### IaC Architecture

```text
INFRASTRUCTURE AS CODE ARCHITECTURE

┌─────────────────────────────────────────────────────────────┐
│ TERRAFORM                                                  │
├─────────────────────────────────────────────────────────────┤
│ ▶ Core infrastructure provisioning                         │
│ ▶ Multi-environment configuration                          │
│ ▶ State management in S3 with DynamoDB locking             │
│ ▶ Modular architecture                                     │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KUBERNETES MANIFESTS                                       │
├─────────────────────────────────────────────────────────────┤
│ ▶ Helm charts for application deployment                   │
│ ▶ Kustomize for environment overlays                       │
│ ▶ Custom operators for banking workloads                   │
│ ▶ Policy enforcement with OPA/Gatekeeper                   │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ CONFIGURATION MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────┤
│ ▶ Ansible for host configuration                           │
│ ▶ Packer for image building                                │
│ ▶ Configuration validation                                 │
│ ▶ Secrets integration                                      │
└─────────────────────────────────────────────────────────────┘
```

| Component | Description | Implementation |
|---------|-------------|----------------|
| **Terraform** | Infrastructure provisioning | Modular design with remote state |
| **Kubernetes Manifests** | Application deployment | Helm charts with Kustomize overlays |
| **Configuration Management** | System configuration | Ansible for host configuration |
| **Image Building** | Machine image creation | Packer with hardened base images |
| **Policy Enforcement** | Governance as code | OPA/Gatekeeper for Kubernetes policies |

### Module Structure

```text
TERRAFORM MODULE STRUCTURE

┌─────────────────────────────────────────────────────────────┐
│ FOUNDATION                                                 │
├─────────────────────────────────────────────────────────────┤
│ ▶ VPC and networking                                       │
│ ▶ IAM and security                                         │
│ ▶ Shared services                                          │
│ ▶ Monitoring infrastructure                                │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER                                                 │
├─────────────────────────────────────────────────────────────┤
│ ▶ PostgreSQL clusters                                      │
│ ▶ Redis caching                                            │
│ ▶ S3 object storage                                        │
│ ▶ Backup and recovery                                      │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ COMPUTE LAYER                                              │
├─────────────────────────────────────────────────────────────┤
│ ▶ EKS clusters                                             │
│ ▶ Node groups                                              │
│ ▶ Auto-scaling configuration                               │
│ ▶ Cluster add-ons                                          │
└───────────────────────────────────────────┬─────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                          │
├─────────────────────────────────────────────────────────────┤
│ ▶ CI/CD infrastructure                                     │
│ ▶ Service mesh                                             │
│ ▶ Ingress and API gateway                                  │
│ ▶ Certificate management                                   │
└─────────────────────────────────────────────────────────────┘
```

| Module | Description | Components |
|---------|-------------|----------------|
| **Foundation** | Core infrastructure components | VPC, IAM, Security Groups, KMS |
| **Data Layer** | Database and storage services | RDS, ElastiCache, S3, DynamoDB |
| **Compute Layer** | Processing infrastructure | EKS, EC2, Lambda, SQS |
| **Application Layer** | Application delivery components | ALB, API Gateway, CloudFront |
| **Security Layer** | Security services | WAF, GuardDuty, Security Hub |

---

## 📊 Implementation Examples

### Terraform Infrastructure Module

```hcl
# modules/eks/main.tf - EKS Cluster Module

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "aurum-${var.environment}-cluster"
  cluster_version = "1.27"

  cluster_endpoint_public_access  = false
  cluster_endpoint_private_access = true

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  # Security groups
  create_cluster_security_group = true
  create_node_security_group    = true

  # Enable IRSA
  enable_irsa = true

  # Encryption key
  create_kms_key = true
  kms_key_deletion_window_in_days = 7
  enable_kms_key_rotation         = true

  # Managed node groups
  eks_managed_node_groups = {
    core = {
      name = "aurum-${var.environment}-core"

      instance_types = ["m5.large", "m5a.large"]
      capacity_type  = "ON_DEMAND"

      min_size     = 3
      max_size     = 10
      desired_size = 3

      disk_size = 100

      # Use launch templates for more customization
      use_custom_launch_template = true
      launch_template_name       = "aurum-${var.environment}-core-lt"

      # Enable monitoring
      enable_monitoring = true

      # Ensure nodes have required labels and taints
      labels = {
        Environment = var.environment
        NodeGroup   = "core"
      }

      # Use bottlerocket OS for enhanced security
      ami_type = "BOTTLEROCKET_x86_64"
      
      # Enable SSM for node management
      enable_bootstrap_user_data = true
      bootstrap_extra_args      = "--enable-amazon-ssm"

      # Add required tags
      tags = merge(
        var.tags,
        {
          "k8s.io/cluster-autoscaler/enabled" = "true"
          "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
        }
      )
    }
    
    # Worker group for compute-intensive workloads
    compute = {
      name = "aurum-${var.environment}-compute"

      instance_types = ["c5.xlarge", "c5a.xlarge"]
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = 10
      desired_size = 1

      disk_size = 100

      # Use launch templates for more customization
      use_custom_launch_template = true
      launch_template_name       = "aurum-${var.environment}-compute-lt"

      # Enable monitoring
      enable_monitoring = true

      # Ensure nodes have required labels and taints
      labels = {
        Environment = var.environment
        NodeGroup   = "compute"
      }
      
      taints = [
        {
          key    = "workload"
          value  = "compute"
          effect = "NO_SCHEDULE"
        }
      ]

      # Use bottlerocket OS for enhanced security
      ami_type = "BOTTLEROCKET_x86_64"
      
      # Enable SSM for node management
      enable_bootstrap_user_data = true
      bootstrap_extra_args      = "--enable-amazon-ssm"

      # Add required tags
      tags = merge(
        var.tags,
        {
          "k8s.io/cluster-autoscaler/enabled" = "true"
          "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
        }
      )
    }
  }

  # Configure aws-auth configmap with additional roles
  manage_aws_auth_configmap = true
  aws_auth_roles = [
    {
      rolearn  = var.admin_role_arn
      username = "admin"
      groups   = ["system:masters"]
    },
    {
      rolearn  = var.developer_role_arn
      username = "developer"
      groups   = ["aurum:developers"]
    },
  ]

  tags = var.tags
}

# Create IRSA for cluster autoscaler
module "cluster_autoscaler_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name                        = "aurum-${var.environment}-cluster-autoscaler"
  attach_cluster_autoscaler_policy = true
  cluster_autoscaler_cluster_ids   = [module.eks.cluster_id]

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:cluster-autoscaler"]
    }
  }

  tags = var.tags
}

# Output important cluster information
output "cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC Provider"
  value       = module.eks.oidc_provider_arn
}
```

### Kubernetes Deployment Manifests

```yaml
# helm/aurum-core-api/templates/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "aurum-core-api.fullname" . }}
  labels:
    {{- include "aurum-core-api.labels" . | nindent 4 }}
    app.kubernetes.io/component: api
    app.kubernetes.io/part-of: aurum-vault
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "aurum-core-api.selectorLabels" . | nindent 6 }}
      app.kubernetes.io/component: api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "{{ .Values.metrics.port }}"
        prometheus.io/path: "/metrics"
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secrets: {{ include (print $.Template.BasePath "/secrets.yaml") . | sha256sum }}
      labels:
        {{- include "aurum-core-api.selectorLabels" . | nindent 8 }}
        app.kubernetes.io/component: api
    spec:
      serviceAccountName: {{ include "aurum-core-api.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.port }}
              protocol: TCP
            - name: metrics
              containerPort: {{ .Values.metrics.port }}
              protocol: TCP
          env:
            - name: NODE_ENV
              value: {{ .Values.environment }}
            - name: LOG_LEVEL
              value: {{ .Values.logging.level }}
            - name: PORT
              value: "{{ .Values.service.port }}"
            - name: METRICS_PORT
              value: "{{ .Values.metrics.port }}"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "aurum-core-api.fullname" . }}-db
                  key: url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "aurum-core-api.fullname" . }}-redis
                  key: url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: {{ include "aurum-core-api.fullname" . }}-jwt
                  key: secret
            - name: CLERK_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: {{ include "aurum-core-api.fullname" . }}-clerk
                  key: secretKey
          volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
            - name: tmp
              mountPath: /tmp
          livenessProbe:
            httpGet:
              path: /health/liveness
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: http
            initialDelaySeconds: 5
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          startupProbe:
            httpGet:
              path: /health/startup
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 12
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
      volumes:
        - name: config
          configMap:
            name: {{ include "aurum-core-api.fullname" . }}-config
        - name: tmp
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              {{- include "aurum-core-api.selectorLabels" . | nindent 14 }}
              app.kubernetes.io/component: api
```

### GitHub Actions CI/CD Workflow

```yaml
# .github/workflows/ci-cd.yml

name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  pull_request:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run SAST scan
        uses: github/codeql-action/analyze@v2
        with:
          languages: javascript, typescript

      - name: Run dependency scan
        uses: snyk/actions/node@master
        with:
          args: --severity-threshold=high
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to ECR
        uses: aws-actions/amazon-ecr-login@v1
        with:
          registries: ${{ secrets.AWS_ACCOUNT_ID }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/aurum-core-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NODE_ENV=production

      - name: Scan container image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/aurum-core-api:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results to GitHub Security tab
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  deploy-dev:
    name: Deploy to Development
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: development
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Update Kubernetes manifests
        run: |
          sed -i "s|image: .*|image: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/aurum-core-api:${{ github.sha }}|g" kubernetes/overlays/development/kustomization.yaml
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add kubernetes/overlays/development/kustomization.yaml
          git commit -m "Update development image to ${{ github.sha }}"
          git push

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: deploy-dev
    environment: staging
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Update Kubernetes manifests
        run: |
          sed -i "s|image: .*|image: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/aurum-core-api:${{ github.sha }}|g" kubernetes/overlays/staging/kustomization.yaml
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add kubernetes/overlays/staging/kustomization.yaml
          git commit -m "Update staging image to ${{ github.sha }}"
          git push

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment: production
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Update Kubernetes manifests
        run: |
          sed -i "s|image: .*|image: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/aurum-core-api:${{ github.sha }}|g" kubernetes/overlays/production/kustomization.yaml
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add kubernetes/overlays/production/kustomization.yaml
          git commit -m "Update production image to ${{ github.sha }}"
          git push
```

---

## 📅 Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- Set up AWS infrastructure with Terraform
- Establish networking and security baseline
- Configure CI/CD pipeline foundations
- Implement core monitoring infrastructure

### Phase 2: Development Environment (Weeks 3-4)
- Deploy Kubernetes clusters
- Set up container registry and build pipelines
- Implement database infrastructure
- Configure development environment

### Phase 3: Staging Environment (Weeks 5-6)
- Deploy staging environment infrastructure
- Implement service mesh and observability
- Configure automated testing infrastructure
- Set up security scanning and compliance checks

### Phase 4: Production Environment (Weeks 7-8)
- Deploy production environment infrastructure
- Implement multi-region capabilities
- Configure disaster recovery systems
- Set up production monitoring and alerting

### Phase 5: Optimization & Hardening (Week 9)
- Performance optimization
- Security hardening
- Compliance validation
- Disaster recovery testing

### Phase 6: Documentation & Handover (Week 10)
- Complete infrastructure documentation
- Conduct knowledge transfer sessions
- Perform final security review
- Establish operational runbooks

---

## 🔍 Success Criteria

### Key Performance Indicators

1. **Availability**: 99.99% uptime for production environment
2. **Deployment Frequency**: Multiple deployments per day with zero downtime
3. **Deployment Lead Time**: Less than 30 minutes from commit to production
4. **Change Failure Rate**: Less than 5% of deployments requiring rollback
5. **Mean Time to Recovery**: Less than 15 minutes for production incidents

### Quality Benchmarks

1. **Security Compliance**: 100% compliance with security requirements
2. **Infrastructure as Code**: 100% of infrastructure managed through IaC
3. **Monitoring Coverage**: 100% of critical services with comprehensive monitoring
4. **Automated Testing**: 95%+ of deployments validated through automated testing
5. **Documentation**: Complete and up-to-date documentation for all systems

---

This deployment and DevOps strategy provides a comprehensive framework for implementing the enterprise-grade infrastructure required for the Aurum Vault banking platform. By following modern DevOps practices and implementing infrastructure as code, the platform will achieve the reliability, security, and operational excellence needed for a premium banking experience.