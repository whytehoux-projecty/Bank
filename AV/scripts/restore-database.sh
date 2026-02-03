#!/bin/bash

# AURUM VAULT - Database Restore Script
# Restores PostgreSQL database from backup file

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/aurumvault}"
DB_NAME="${DB_NAME:-aurumvault}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/aurumvault_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Validate backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "========================================="
echo "AURUM VAULT Database Restore"
echo "========================================="
echo "WARNING: This will REPLACE the current database!"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""

# Confirmation prompt
read -p "Are you sure you want to continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "Starting restore at: $(date)"

# Create temporary directory for decompression
TEMP_DIR=$(mktemp -d)
TEMP_SQL="$TEMP_DIR/restore.sql"

# Decompress backup
echo "Decompressing backup..."
if gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"; then
    echo "✓ Backup decompressed successfully"
else
    echo "✗ Decompression failed!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Drop existing database (with confirmation)
echo "Dropping existing database..."
if PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>&1; then
    echo "✓ Existing database dropped"
else
    echo "✗ Failed to drop database!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Create new database
echo "Creating new database..."
if PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME;" 2>&1; then
    echo "✓ New database created"
else
    echo "✗ Failed to create database!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Restore database
echo "Restoring database from backup..."
if PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    < "$TEMP_SQL" 2>&1; then
    echo "✓ Database restored successfully"
else
    echo "✗ Database restore failed!"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Clean up temporary files
rm -rf "$TEMP_DIR"

# Verify restore
echo "Verifying restore..."
TABLE_COUNT=$(PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "✓ Restore verified ($TABLE_COUNT tables found)"

echo ""
echo "========================================="
echo "Restore Summary"
echo "========================================="
echo "Status: SUCCESS ✓"
echo "Database: $DB_NAME"
echo "Tables restored: $TABLE_COUNT"
echo "Completed at: $(date)"
echo "========================================="

exit 0
