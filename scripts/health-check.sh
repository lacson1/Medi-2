#!/bin/bash

# MediFlow System Health Check Script
# This script monitors system health and alerts on issues

set -e

# Configuration
BACKUP_DIR="/Users/lacbis/Med flow/medi-flow-b920c902/backups"
CONTAINER_NAME="mediflow-postgres"
BACKEND_CONTAINER="mediflow-backend"
FRONTEND_CONTAINER="mediflow-frontend"
LOG_FILE="/Users/lacbis/Med flow/medi-flow-b920c902/logs/health-check.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}MediFlow System Health Check${NC}"
log "Starting system health check"

# Check Docker status
echo -e "${YELLOW}Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    log "ERROR: Docker is not running"
    exit 1
else
    echo -e "${GREEN}✓ Docker is running${NC}"
    log "INFO: Docker is running"
fi

# Check PostgreSQL container
echo -e "${YELLOW}Checking PostgreSQL container...${NC}"
if docker ps --format "table {{.Names}}" | grep -q "$CONTAINER_NAME"; then
    echo -e "${GREEN}✓ PostgreSQL container is running${NC}"
    log "INFO: PostgreSQL container is running"
    
    # Test database connection
    if docker exec "$CONTAINER_NAME" pg_isready -U mediflow -d mediflow > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database connection is healthy${NC}"
        log "INFO: Database connection is healthy"
    else
        echo -e "${RED}✗ Database connection failed${NC}"
        log "ERROR: Database connection failed"
    fi
else
    echo -e "${RED}✗ PostgreSQL container is not running${NC}"
    log "ERROR: PostgreSQL container is not running"
fi

# Check Backend container
echo -e "${YELLOW}Checking Backend container...${NC}"
if docker ps --format "table {{.Names}}" | grep -q "$BACKEND_CONTAINER"; then
    echo -e "${GREEN}✓ Backend container is running${NC}"
    log "INFO: Backend container is running"
    
    # Test backend health endpoint
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend API is responding${NC}"
        log "INFO: Backend API is responding"
    else
        echo -e "${RED}✗ Backend API is not responding${NC}"
        log "ERROR: Backend API is not responding"
    fi
else
    echo -e "${RED}✗ Backend container is not running${NC}"
    log "ERROR: Backend container is not running"
fi

# Check Frontend container
echo -e "${YELLOW}Checking Frontend container...${NC}"
if docker ps --format "table {{.Names}}" | grep -q "$FRONTEND_CONTAINER"; then
    echo -e "${GREEN}✓ Frontend container is running${NC}"
    log "INFO: Frontend container is running"
else
    echo -e "${RED}✗ Frontend container is not running${NC}"
    log "ERROR: Frontend container is not running"
fi

# Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}✗ Disk usage is critical: ${DISK_USAGE}%${NC}"
    log "ERROR: Disk usage is critical: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${YELLOW}⚠ Disk usage is high: ${DISK_USAGE}%${NC}"
    log "WARNING: Disk usage is high: ${DISK_USAGE}%"
else
    echo -e "${GREEN}✓ Disk usage is normal: ${DISK_USAGE}%${NC}"
    log "INFO: Disk usage is normal: ${DISK_USAGE}%"
fi

# Check backup directory
echo -e "${YELLOW}Checking backup directory...${NC}"
if [ -d "$BACKUP_DIR" ]; then
    BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Found $BACKUP_COUNT backup files${NC}"
        log "INFO: Found $BACKUP_COUNT backup files"
        
        # Check latest backup age
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -1)
        if [ -n "$LATEST_BACKUP" ]; then
            BACKUP_AGE=$(($(date +%s) - $(stat -f %m "$LATEST_BACKUP")))
            BACKUP_AGE_DAYS=$((BACKUP_AGE / 86400))
            
            if [ "$BACKUP_AGE_DAYS" -gt 7 ]; then
                echo -e "${RED}✗ Latest backup is $BACKUP_AGE_DAYS days old${NC}"
                log "ERROR: Latest backup is $BACKUP_AGE_DAYS days old"
            else
                echo -e "${GREEN}✓ Latest backup is $BACKUP_AGE_DAYS days old${NC}"
                log "INFO: Latest backup is $BACKUP_AGE_DAYS days old"
            fi
        fi
    else
        echo -e "${RED}✗ No backup files found${NC}"
        log "ERROR: No backup files found"
    fi
else
    echo -e "${RED}✗ Backup directory does not exist${NC}"
    log "ERROR: Backup directory does not exist"
fi

# Check memory usage
echo -e "${YELLOW}Checking memory usage...${NC}"
MEMORY_USAGE=$(ps -A -o %mem | awk '{s+=$1} END {print s}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo -e "${RED}✗ Memory usage is critical: ${MEMORY_USAGE}%${NC}"
    log "ERROR: Memory usage is critical: ${MEMORY_USAGE}%"
elif (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo -e "${YELLOW}⚠ Memory usage is high: ${MEMORY_USAGE}%${NC}"
    log "WARNING: Memory usage is high: ${MEMORY_USAGE}%"
else
    echo -e "${GREEN}✓ Memory usage is normal: ${MEMORY_USAGE}%${NC}"
    log "INFO: Memory usage is normal: ${MEMORY_USAGE}%"
fi

echo -e "${BLUE}Health check completed${NC}"
log "Health check completed"
