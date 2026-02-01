#!/bin/bash

###############################################################################
# UHI Staff Portal - Database Restore Script
#
# This script restores the PostgreSQL database from a backup file.
#
# Usage: ./restore-database.sh <backup_file>
# Example: ./restore-database.sh uhi_backup_20260201_020000.sql.gz
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/uhi-staff-portal}"

# Load environment variables
if [ -f "${PROJECT_ROOT}/.env" ]; then
    export $(grep -v '^#' "${PROJECT_ROOT}/.env" | xargs)
fi

# Required variables
: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set}"
: "${POSTGRES_DB:?POSTGRES_DB not set}"
: "${POSTGRES_HOST:=localhost}"
: "${POSTGRES_PORT:=5432}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if backup file is provided
if [ $# -eq 0 ]; then
    log_error "No backup file specified"
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 uhi_backup_20260201_020000.sql.gz"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/uhi_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Check if backup file exists
if [ ! -f "$BACKUP_PATH" ]; then
    # Try without directory prefix
    if [ -f "$BACKUP_FILE" ]; then
        BACKUP_PATH="$BACKUP_FILE"
    else
        log_error "Backup file not found: $BACKUP_PATH"
        exit 1
    fi
fi

# Confirm restore operation
log_warn "WARNING: This will REPLACE all data in database '$POSTGRES_DB'"
log_info "Backup file: $BACKUP_PATH"
log_info "Database: $POSTGRES_DB@$POSTGRES_HOST:$POSTGRES_PORT"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_info "Restore cancelled by user"
    exit 0
fi

# Verify backup file integrity
log_info "Verifying backup file integrity..."
if ! gzip -t "$BACKUP_PATH"; then
    log_error "Backup file is corrupted!"
    exit 1
fi
log_info "Backup file integrity verified"

# Create pre-restore backup
log_info "Creating pre-restore backup..."
PRE_RESTORE_BACKUP="${BACKUP_DIR}/pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
export PGPASSWORD="$POSTGRES_PASSWORD"

pg_dump -h "$POSTGRES_HOST" \
        -p "$POSTGRES_PORT" \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --format=custom \
        2>&1 | gzip > "$PRE_RESTORE_BACKUP"

log_info "Pre-restore backup saved: $PRE_RESTORE_BACKUP"

# Terminate existing connections
log_info "Terminating existing database connections..."
psql -h "$POSTGRES_HOST" \
     -p "$POSTGRES_PORT" \
     -U "$POSTGRES_USER" \
     -d postgres \
     -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$POSTGRES_DB' AND pid <> pg_backend_pid();" \
     > /dev/null 2>&1 || true

# Drop and recreate database
log_info "Dropping existing database..."
psql -h "$POSTGRES_HOST" \
     -p "$POSTGRES_PORT" \
     -U "$POSTGRES_USER" \
     -d postgres \
     -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" \
     > /dev/null

log_info "Creating new database..."
psql -h "$POSTGRES_HOST" \
     -p "$POSTGRES_PORT" \
     -U "$POSTGRES_USER" \
     -d postgres \
     -c "CREATE DATABASE $POSTGRES_DB;" \
     > /dev/null

# Restore database
log_info "Restoring database from backup..."
if gunzip -c "$BACKUP_PATH" | \
   pg_restore -h "$POSTGRES_HOST" \
              -p "$POSTGRES_PORT" \
              -U "$POSTGRES_USER" \
              -d "$POSTGRES_DB" \
              --verbose \
              --no-owner \
              --no-acl \
              2>&1; then
    log_info "Database restored successfully"
else
    log_error "Database restore failed!"
    log_warn "Attempting to restore from pre-restore backup..."
    
    # Restore from pre-restore backup
    psql -h "$POSTGRES_HOST" \
         -p "$POSTGRES_PORT" \
         -U "$POSTGRES_USER" \
         -d postgres \
         -c "DROP DATABASE IF EXISTS $POSTGRES_DB;" \
         > /dev/null
    
    psql -h "$POSTGRES_HOST" \
         -p "$POSTGRES_PORT" \
         -U "$POSTGRES_USER" \
         -d postgres \
         -c "CREATE DATABASE $POSTGRES_DB;" \
         > /dev/null
    
    gunzip -c "$PRE_RESTORE_BACKUP" | \
    pg_restore -h "$POSTGRES_HOST" \
               -p "$POSTGRES_PORT" \
               -U "$POSTGRES_USER" \
               -d "$POSTGRES_DB" \
               --no-owner \
               --no-acl \
               > /dev/null 2>&1
    
    log_info "Rolled back to pre-restore state"
    exit 1
fi

# Run Prisma migrations
log_info "Running Prisma migrations..."
cd "$PROJECT_ROOT/staff_backend"
if npx prisma migrate deploy; then
    log_info "Prisma migrations completed"
else
    log_warn "Prisma migrations failed (this may be expected)"
fi

# Unset password
unset PGPASSWORD

log_info "=== Database Restore Completed Successfully ==="
log_info "Pre-restore backup saved at: $PRE_RESTORE_BACKUP"
