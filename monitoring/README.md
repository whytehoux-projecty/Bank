# AURUM VAULT Monitoring Stack

This directory contains the configuration for the monitoring stack, including Grafana, Prometheus, and Alertmanager.

## 📊 Overview

- **Grafana**: Dashboard visualization (Port 3000)
- **Prometheus**: Metrics collection (Port 9090)
- **Alertmanager**: Alert handling (Port 9093)

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker Compose

### Start Monitoring

```bash
cd monitoring
docker-compose -f docker-compose.monitoring.yml up -d
```

### Access Dashboards

- **Grafana**: [http://localhost:3000](http://localhost:3000) (Default login: admin/admin)
- **Prometheus**: [http://localhost:9090](http://localhost:9090)
- **Alertmanager**: [http://localhost:9093](http://localhost:9093)

## ⚙️ Configuration

- `prometheus/prometheus.yml`: Prometheus scrape configs
- `prometheus/alerts/`: Alert rules
- `grafana/provisioning/`: Dashboard and datasource provisioning

## 🔌 Integration

The monitoring stack scrapes metrics from:

- Backend Core API
- Admin Interface
- E-Banking Portal (if exposing metrics)
- System resources (Node Exporter if enabled)
