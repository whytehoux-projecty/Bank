#!/bin/bash

# AURUM VAULT - Automated Database Backup Script
# Performs PostgreSQL database backups with rotation and compression

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/aurumvault}"
DB_NAME="${DB_NAME:-aurumvault}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${S3_BUCKET:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/aurumvault_backup_$TIMESTAMP.sql"
COMPRESSED_FILE="$BACKUP_FILE.gz"

echo "========================================="
echo "AURUM VAULT Database Backup"
echo "========================================="
echo "Started at: $(date)"
echo "Database: $DB_NAME"
echo "Backup file: $COMPRESSED_FILE"
echo ""

# Perform backup
echo "Creating database backup..."
if PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    --verbose \
    > "$BACKUP_FILE" 2>&1; then
    
    echo "✓ Database dump completed successfully"
else
    echo "✗ Database dump failed!"
    send_notification "❌ Database backup failed for $DB_NAME"
    exit 1
fi

# Compress backup
echo "Compressing backup..."
if gzip "$BACKUP_FILE"; then
    echo "✓ Backup compressed successfully"
    BACKUP_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "✗ Compression failed!"
    exit 1
fi

# Upload to S3 if configured
if [ -n "$S3_BUCKET" ]; then
    echo "Uploading to S3..."
    if aws s3 cp "$COMPRESSED_FILE" "s3://$S3_BUCKET/backups/database/" --storage-class STANDARD_IA; then
        echo "✓ Uploaded to S3 successfully"
    else
        echo "⚠ S3 upload failed (continuing anyway)"
    fi
fi

# Clean up old backups
echo "Cleaning up old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "aurumvault_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "✓ Old backups cleaned up"

# Verify backup integrity
echo "Verifying backup integrity..."
if gunzip -t "$COMPRESSED_FILE"; then
    echo "✓ Backup integrity verified"
else
    echo "✗ Backup verification failed!"
    send_notification "❌ Backup verification failed for $DB_NAME"
    exit 1
fi

# Calculate backup statistics
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "aurumvault_backup_*.sql.gz" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo ""
echo "========================================="
echo "Backup Summary"
echo "========================================="
echo "Status: SUCCESS ✓"
echo "Backup file: $COMPRESSED_FILE"
echo "Backup size: $BACKUP_SIZE"
echo "Total backups: $TOTAL_BACKUPS"
echo "Total backup size: $TOTAL_SIZE"
echo "Completed at: $(date)"
echo "========================================="

# Send success notification
send_notification "✅ Database backup completed successfully
Database: $DB_NAME
Size: $BACKUP_SIZE
Location: $COMPRESSED_FILE"

# Function to send notifications
function send_notification() {
    local message="$1"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST "$SLACK_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{\"text\":\"$message\"}" \
            > /dev/null 2>&1 || true
    fi
    
    # Log to syslog
    logger -t aurumvault-backup "$message"
}

exit 0
