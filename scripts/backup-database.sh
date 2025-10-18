#!/bin/bash

# MediFlow Database Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="/Users/lacbis/Med flow/medi-flow-b920c902/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mediflow_backup_${DATE}.sql"
CONTAINER_NAME="mediflow-postgres"
DB_NAME="mediflow"
DB_USER="mediflow"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting MediFlow Database Backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

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

# Create database backup
echo -e "${YELLOW}Creating database backup...${NC}"
docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database backup created successfully: $BACKUP_FILE${NC}"
    
    # Get backup file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup size: $BACKUP_SIZE${NC}"
    
    # Compress the backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup compressed: ${BACKUP_FILE}.gz${NC}"
    
    # Clean up old backups (keep last 7 days)
    echo -e "${YELLOW}Cleaning up old backups...${NC}"
    find "$BACKUP_DIR" -name "mediflow_backup_*.sql.gz" -mtime +7 -delete
    echo -e "${GREEN}✓ Old backups cleaned up${NC}"
    
else
    echo -e "${RED}✗ Database backup failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Database backup completed successfully!${NC}"
echo -e "${YELLOW}Backup location: $BACKUP_DIR/${BACKUP_FILE}.gz${NC}"
