#!/bin/bash

# MediFlow Database Restore Script
# This script restores the PostgreSQL database from a backup file

set -e

# Configuration
BACKUP_DIR="/Users/lacbis/Med flow/medi-flow-b920c902/backups"
CONTAINER_NAME="mediflow-postgres"
DB_NAME="mediflow"
DB_USER="mediflow"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}MediFlow Database Restore Utility${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if PostgreSQL container is running
if ! docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container '$CONTAINER_NAME' is not running.${NC}"
    echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
    cd "/Users/lacbis/Med flow/medi-flow-b920c902"
    docker-compose up -d postgres
    
    # Wait for container to be ready
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 10
fi

# List available backups
echo -e "${YELLOW}Available backups:${NC}"
ls -la "$BACKUP_DIR"/*.sql.gz 2>/dev/null || {
    echo -e "${RED}No backup files found in $BACKUP_DIR${NC}"
    exit 1
}

# Get backup file from user
echo -e "${YELLOW}Enter the backup filename (without path):${NC}"
read -r BACKUP_FILE

# Validate backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file '$BACKUP_FILE' not found in $BACKUP_DIR${NC}"
    exit 1
fi

# Confirm restore operation
echo -e "${RED}WARNING: This will completely replace the current database!${NC}"
echo -e "${YELLOW}Are you sure you want to restore from '$BACKUP_FILE'? (yes/no):${NC}"
read -r CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

# Create temporary uncompressed file
TEMP_FILE="/tmp/restore_$(date +%s).sql"
echo -e "${YELLOW}Preparing backup file...${NC}"

if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$TEMP_FILE"
else
    cp "$BACKUP_DIR/$BACKUP_FILE" "$TEMP_FILE"
fi

# Drop and recreate database
echo -e "${YELLOW}Dropping existing database...${NC}"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

# Restore database
echo -e "${YELLOW}Restoring database from backup...${NC}"
docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$TEMP_FILE"

# Clean up temporary file
rm -f "$TEMP_FILE"

# Verify restore
echo -e "${YELLOW}Verifying restore...${NC}"
TABLE_COUNT=$(docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Database restore completed successfully!${NC}"
    echo -e "${GREEN}✓ Restored $TABLE_COUNT tables${NC}"
else
    echo -e "${RED}✗ Database restore may have failed - no tables found${NC}"
    exit 1
fi

echo -e "${GREEN}Database restore completed successfully!${NC}"
