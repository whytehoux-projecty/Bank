#!/bin/bash

###############################################################################
# UHI Staff Portal - Docker Deployment Test Script
#
# This script tests the complete Docker deployment in a staging environment
# including health checks, database migrations, and service verification.
#
# Usage: ./test-docker-deployment.sh [environment]
# Example: ./test-docker-deployment.sh staging
###############################################################################

set -e  # Exit on error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-staging}"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
MONITORING_COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.monitoring.yml"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Test result function
test_result() {
    local test_name=$1
    local result=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$result" -eq 0 ]; then
        log_info "✅ PASSED: $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error "❌ FAILED: $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Pre-flight checks
preflight_checks() {
    log_step "Running pre-flight checks..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    test_result "Docker installed" 0
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    test_result "Docker Compose installed" 0
    
    # Check environment file
    if [ ! -f "${PROJECT_ROOT}/.env" ]; then
        log_warn ".env file not found, copying from .env.docker.example"
        cp "${PROJECT_ROOT}/.env.docker.example" "${PROJECT_ROOT}/.env"
    fi
    test_result "Environment file exists" 0
    
    # Check disk space
    AVAILABLE_SPACE=$(df -h / | awk 'NR==2 {print $4}' | sed 's/G//')
    if (( $(echo "$AVAILABLE_SPACE < 10" | bc -l) )); then
        log_warn "Low disk space: ${AVAILABLE_SPACE}GB available"
    fi
    test_result "Sufficient disk space" 0
}

# Build Docker images
build_images() {
    log_step "Building Docker images..."
    
    cd "$PROJECT_ROOT"
    
    if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
        test_result "Docker images built successfully" 0
    else
        test_result "Docker images build failed" 1
        return 1
    fi
}

# Start services
start_services() {
    log_step "Starting services..."
    
    cd "$PROJECT_ROOT"
    
    if docker-compose -f "$COMPOSE_FILE" up -d; then
        test_result "Services started successfully" 0
        sleep 10  # Wait for services to initialize
    else
        test_result "Services start failed" 1
        return 1
    fi
}

# Check service health
check_service_health() {
    log_step "Checking service health..."
    
    # PostgreSQL
    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U uhi_user > /dev/null 2>&1; then
        test_result "PostgreSQL is healthy" 0
    else
        test_result "PostgreSQL health check failed" 1
    fi
    
    # Redis
    if docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
        test_result "Redis is healthy" 0
    else
        test_result "Redis health check failed" 1
    fi
    
    # Backend API
    sleep 5  # Additional wait for backend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        test_result "Backend API is healthy" 0
    else
        test_result "Backend API health check failed" 1
    fi
    
    # Staff Portal
    if curl -f http://localhost:3001 > /dev/null 2>&1; then
        test_result "Staff Portal is accessible" 0
    else
        test_result "Staff Portal health check failed" 1
    fi
    
    # Admin Interface
    if curl -f http://localhost:3002 > /dev/null 2>&1; then
        test_result "Admin Interface is accessible" 0
    else
        test_result "Admin Interface health check failed" 1
    fi
}

# Run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    if docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma migrate deploy; then
        test_result "Database migrations completed" 0
    else
        test_result "Database migrations failed" 1
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    log_step "Testing API endpoints..."
    
    # Health endpoint
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
    if echo "$HEALTH_RESPONSE" | grep -q "UP"; then
        test_result "Health endpoint returns UP status" 0
    else
        test_result "Health endpoint test failed" 1
    fi
    
    # CSRF token endpoint
    CSRF_RESPONSE=$(curl -s http://localhost:3000/api/v1/csrf-token)
    if echo "$CSRF_RESPONSE" | grep -q "csrfToken"; then
        test_result "CSRF token endpoint works" 0
    else
        test_result "CSRF token endpoint failed" 1
    fi
    
    # API documentation
    if curl -f http://localhost:3000/api-docs > /dev/null 2>&1; then
        test_result "API documentation is accessible" 0
    else
        test_result "API documentation test failed" 1
    fi
}

# Check container logs for errors
check_logs() {
    log_step "Checking container logs for errors..."
    
    # Backend logs
    BACKEND_ERRORS=$(docker-compose -f "$COMPOSE_FILE" logs backend | grep -i "error" | wc -l)
    if [ "$BACKEND_ERRORS" -eq 0 ]; then
        test_result "No errors in backend logs" 0
    else
        log_warn "Found $BACKEND_ERRORS error entries in backend logs"
        test_result "Backend logs contain errors" 1
    fi
}

# Test database connection
test_database() {
    log_step "Testing database connection..."
    
    # Test connection
    if docker-compose -f "$COMPOSE_FILE" exec -T backend npx prisma db push --skip-generate > /dev/null 2>&1; then
        test_result "Database connection successful" 0
    else
        test_result "Database connection failed" 1
    fi
}

# Test Redis connection
test_redis() {
    log_step "Testing Redis connection..."
    
    # Set and get a test key
    docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli SET test_key "test_value" > /dev/null 2>&1
    REDIS_VALUE=$(docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli GET test_key)
    
    if echo "$REDIS_VALUE" | grep -q "test_value"; then
        test_result "Redis read/write operations work" 0
    else
        test_result "Redis operations failed" 1
    fi
    
    # Cleanup
    docker-compose -f "$COMPOSE_FILE" exec -T redis redis-cli DEL test_key > /dev/null 2>&1
}

# Performance test
performance_test() {
    log_step "Running basic performance test..."
    
    # Test response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/health)
    
    if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l) )); then
        log_info "Health endpoint response time: ${RESPONSE_TIME}s"
        test_result "Response time is acceptable" 0
    else
        log_warn "Health endpoint response time: ${RESPONSE_TIME}s (slow)"
        test_result "Response time is slow" 1
    fi
}

# Security checks
security_checks() {
    log_step "Running security checks..."
    
    # Check if services are running as non-root
    BACKEND_USER=$(docker-compose -f "$COMPOSE_FILE" exec -T backend whoami)
    if [ "$BACKEND_USER" != "root" ]; then
        test_result "Backend runs as non-root user" 0
    else
        test_result "Backend runs as root (security risk)" 1
    fi
    
    # Check for exposed secrets in logs
    if docker-compose -f "$COMPOSE_FILE" logs | grep -qi "password\|secret\|key" | head -5; then
        log_warn "Potential secrets found in logs"
        test_result "No secrets in logs" 1
    else
        test_result "No secrets exposed in logs" 0
    fi
}

# Cleanup
cleanup() {
    log_step "Cleaning up..."
    
    if [ "$1" == "full" ]; then
        log_info "Stopping and removing all containers, networks, and volumes..."
        docker-compose -f "$COMPOSE_FILE" down -v
    else
        log_info "Stopping containers (keeping volumes)..."
        docker-compose -f "$COMPOSE_FILE" down
    fi
}

# Generate test report
generate_report() {
    log_step "Generating test report..."
    
    REPORT_FILE="${PROJECT_ROOT}/docker-test-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=========================================="
        echo "UHI Staff Portal - Docker Deployment Test"
        echo "=========================================="
        echo ""
        echo "Environment: $ENVIRONMENT"
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "Test Results:"
        echo "  Total Tests: $TOTAL_TESTS"
        echo "  Passed: $TESTS_PASSED"
        echo "  Failed: $TESTS_FAILED"
        echo "  Success Rate: $(echo "scale=2; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc)%"
        echo ""
        echo "=========================================="
    } > "$REPORT_FILE"
    
    log_info "Test report saved to: $REPORT_FILE"
    
    # Display summary
    echo ""
    echo "=========================================="
    echo "Test Summary"
    echo "=========================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    echo "Success Rate: $(echo "scale=2; $TESTS_PASSED * 100 / $TOTAL_TESTS" | bc)%"
    echo "=========================================="
}

# Main execution
main() {
    log_info "=== UHI Staff Portal Docker Deployment Test ==="
    log_info "Environment: $ENVIRONMENT"
    echo ""
    
    # Run tests
    preflight_checks
    build_images
    start_services
    check_service_health
    run_migrations
    test_database
    test_redis
    test_api_endpoints
    check_logs
    performance_test
    security_checks
    
    # Generate report
    generate_report
    
    # Cleanup prompt
    echo ""
    read -p "Do you want to stop the containers? (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        read -p "Remove volumes as well? (yes/no): " -r
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            cleanup "full"
        else
            cleanup
        fi
    fi
    
    # Exit with appropriate code
    if [ "$TESTS_FAILED" -eq 0 ]; then
        log_info "=== All Tests Passed! ==="
        exit 0
    else
        log_error "=== Some Tests Failed ==="
        exit 1
    fi
}

# Run main function
main "$@"
