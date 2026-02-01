#!/bin/bash

###############################################################################
# UHI Staff Portal - Database Backup Script
# 
# This script creates automated backups of the PostgreSQL database
# and uploads them to AWS S3 for secure storage.
#
# Usage: ./backup-database.sh
# Cron: 0 2 * * * /path/to/backup-database.sh >> /var/log/uhi-backup.log 2>&1
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/uhi-staff-portal}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="uhi_backup_${TIMESTAMP}.sql.gz"

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

# Optional S3 configuration
S3_ENABLED="${BACKUP_S3_ENABLED:-false}"
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

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

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log_info "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Perform database backup
backup_database() {
    log_info "Starting database backup..."
    log_info "Database: $POSTGRES_DB"
    log_info "Backup file: $BACKUP_FILE"

    # Set password for pg_dump
    export PGPASSWORD="$POSTGRES_PASSWORD"

    # Perform backup with compression
    if pg_dump -h "$POSTGRES_HOST" \
               -p "$POSTGRES_PORT" \
               -U "$POSTGRES_USER" \
               -d "$POSTGRES_DB" \
               --format=custom \
               --verbose \
               2>&1 | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"; then
        log_info "Database backup completed successfully"
        
        # Get backup file size
        BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
        log_info "Backup size: $BACKUP_SIZE"
    else
        log_error "Database backup failed"
        exit 1
    fi

    # Unset password
    unset PGPASSWORD
}

# Upload to S3
upload_to_s3() {
    if [ "$S3_ENABLED" = "true" ] && [ -n "$S3_BUCKET" ]; then
        log_info "Uploading backup to S3: s3://${S3_BUCKET}/backups/"
        
        if command -v aws &> /dev/null; then
            if aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" \
                      "s3://${S3_BUCKET}/backups/${BACKUP_FILE}" \
                      --region "$AWS_REGION" \
                      --storage-class STANDARD_IA; then
                log_info "Backup uploaded to S3 successfully"
            else
                log_error "Failed to upload backup to S3"
                return 1
            fi
        else
            log_warn "AWS CLI not found. Skipping S3 upload."
        fi
    else
        log_info "S3 upload disabled or not configured"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up backups older than $RETENTION_DAYS days..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "uhi_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    
    local deleted_count=$(find "$BACKUP_DIR" -name "uhi_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS | wc -l)
    log_info "Deleted $deleted_count old local backups"

    # S3 cleanup
    if [ "$S3_ENABLED" = "true" ] && [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log_info "Cleaning up old S3 backups..."
        
        # Calculate date threshold
        THRESHOLD_DATE=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
        
        # List and delete old backups from S3
        aws s3 ls "s3://${S3_BUCKET}/backups/" --region "$AWS_REGION" | \
        while read -r line; do
            BACKUP_DATE=$(echo "$line" | awk '{print $4}' | grep -oP 'uhi_backup_\K\d{8}')
            if [ -n "$BACKUP_DATE" ] && [ "$BACKUP_DATE" -lt "$THRESHOLD_DATE" ]; then
                BACKUP_KEY=$(echo "$line" | awk '{print $4}')
                log_info "Deleting old S3 backup: $BACKUP_KEY"
                aws s3 rm "s3://${S3_BUCKET}/backups/${BACKUP_KEY}" --region "$AWS_REGION"
            fi
        done
    fi
}

# Verify backup integrity
verify_backup() {
    log_info "Verifying backup integrity..."
    
    if gzip -t "${BACKUP_DIR}/${BACKUP_FILE}"; then
        log_info "Backup file integrity verified"
        return 0
    else
        log_error "Backup file is corrupted!"
        return 1
    fi
}

# Send notification (optional)
send_notification() {
    local status=$1
    local message=$2
    
    # Add your notification logic here (email, Slack, etc.)
    # Example: curl -X POST $SLACK_WEBHOOK -d "{\"text\": \"$message\"}"
    
    log_info "Notification: $message"
}

# Main execution
main() {
    log_info "=== UHI Staff Portal Database Backup Started ==="
    
    # Create backup directory
    create_backup_dir
    
    # Perform backup
    if backup_database; then
        # Verify backup
        if verify_backup; then
            # Upload to S3
            upload_to_s3
            
            # Cleanup old backups
            cleanup_old_backups
            
            log_info "=== Backup Process Completed Successfully ==="
            send_notification "success" "Database backup completed successfully: $BACKUP_FILE"
            exit 0
        else
            log_error "Backup verification failed"
            send_notification "error" "Database backup verification failed"
            exit 1
        fi
    else
        log_error "Backup process failed"
        send_notification "error" "Database backup failed"
        exit 1
    fi
}

# Run main function
main "$@"
