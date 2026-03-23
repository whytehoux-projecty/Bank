# NovaBank Backend - Docker Setup

This directory contains Docker configuration files for running the NovaBank backend services in containerized environments.

## 🐳 Services

The Docker setup includes the following services:

- **PostgreSQL Database** (`novabank-db`) - Primary database on port 5432
- **Redis Cache** (`novabank-redis`) - Session store and cache on port 6379
- **Core API** (`novabank-core-api`) - Main banking API on port 3000
- **Admin Interface** (`novabank-admin-interface`) - Admin dashboard API on port 3001
- **pgAdmin** (`novabank-pgadmin`) - Database management UI on port 5050
- **Redis Commander** (`novabank-redis-commander`) - Redis management UI on port 8081

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for containers

### Setup

1. **Copy environment file:**

   ```bash
   cp .env.example .env
   ```

2. **Update environment variables:**
   Edit `.env` file with your configuration values, especially:
   - Database passwords
   - JWT secrets
   - External service API keys

3. **Start all services:**

   ```bash
   docker-compose up -d
   ```

4. **Check service health:**

   ```bash
   docker-compose ps
   ```

## 📋 Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `secure_password_123` |
| `REDIS_PASSWORD` | Redis password | `redis_secure_123` |
| `JWT_SECRET` | JWT signing secret | `your_jwt_secret_key_here` |
| `COOKIE_SECRET` | Cookie signing secret | `your_cookie_secret_here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Core API CORS origin | `http://localhost:3000` |
| `ADMIN_CORS_ORIGIN` | Admin API CORS origin | `http://localhost:3001` |
| `PGADMIN_PASSWORD` | pgAdmin password | `admin_password_123` |

## 🔧 Development Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres redis

# Start with logs
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop specific service
docker-compose stop core-api
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f core-api

# Last 100 lines
docker-compose logs --tail=100 admin-interface
```

### Database Operations

```bash
# Run database migrations
docker-compose exec core-api npm run db:migrate

# Seed database
docker-compose exec core-api npm run db:seed

# Open Prisma Studio
docker-compose exec core-api npm run db:studio
```

## 🏥 Health Checks

All services include health checks:

- **PostgreSQL**: `pg_isready` command
- **Redis**: Redis ping command
- **Core API**: HTTP GET `/api/health`
- **Admin Interface**: HTTP GET `/api/health`

Check health status:

```bash
docker-compose ps
```

## 🔍 Service URLs

When running locally:

- **Core API**: <http://localhost:3000>
- **Admin Interface**: <http://localhost:3001>
- **pgAdmin**: <http://localhost:5050>
- **Redis Commander**: <http://localhost:8081>

### pgAdmin Access

- **Email**: <admin@novabank.com>
- **Password**: Set in `PGADMIN_PASSWORD` environment variable

### Database Connection (pgAdmin)

- **Host**: postgres
- **Port**: 5432
- **Database**: novabank
- **Username**: novabank_admin
- **Password**: Set in `DB_PASSWORD` environment variable

## 🔒 Security Considerations

### Production Deployment

1. **Change default passwords** in environment variables
2. **Use strong secrets** for JWT and cookies (32+ characters)
3. **Enable SSL/TLS** for external connections
4. **Restrict network access** using Docker networks
5. **Use secrets management** instead of environment files
6. **Enable container security scanning**

### Network Security

The setup uses a custom Docker network (`novabank-network`) to isolate services. Only necessary ports are exposed to the host.

## 📊 Monitoring

### Container Metrics

```bash
# Resource usage
docker stats

# Service status
docker-compose ps

# Container inspection
docker inspect novabank-core-api
```

### Application Logs

```bash
# Real-time logs
docker-compose logs -f core-api admin-interface

# Error logs only
docker-compose logs | grep ERROR
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**:

   ```bash
   # Check port usage
   lsof -i :3000
   
   # Change ports in docker-compose.yml
   ```

2. **Database connection issues**:

   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test connection
   docker-compose exec postgres psql -U novabank_admin -d novabank
   ```

3. **Redis connection issues**:

   ```bash
   # Check Redis logs
   docker-compose logs redis
   
   # Test connection
   docker-compose exec redis redis-cli ping
   ```

4. **Service startup failures**:

   ```bash
   # Check service logs
   docker-compose logs [service-name]
   
   # Restart service
   docker-compose restart [service-name]
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v --remove-orphans

# Remove all NovaBank images
docker images | grep novabank | awk '{print $3}' | xargs docker rmi

# Start fresh
docker-compose up -d --build
```

## 🔄 Updates and Maintenance

### Update Services

```bash
# Rebuild and restart
docker-compose up -d --build

# Update specific service
docker-compose up -d --build core-api
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U novabank_admin novabank > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U novabank_admin novabank < backup.sql
```

### Clean Up

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune
```

## 📝 Configuration Files

- `docker-compose.yml` - Main service orchestration
- `Dockerfile.api` - Core API container build
- `Dockerfile.admin` - Admin interface container build
- `.env.example` - Environment variables template

## 🤝 Contributing

When modifying Docker configuration:

1. Test changes locally
2. Update documentation
3. Verify health checks work
4. Test with clean environment
5. Update version tags appropriately

## 📄 License

This Docker configuration is part of the NovaBank project and follows the same license terms.
