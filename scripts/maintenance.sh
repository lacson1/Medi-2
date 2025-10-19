#!/bin/bash

# MediFlow Maintenance Script
# Consolidated script for common maintenance tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "MediFlow Maintenance Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  lint          Run ESLint to check for code issues"
    echo "  lint-fix      Run ESLint with auto-fix"
    echo "  test          Run tests"
    echo "  build         Build the application"
    echo "  dev           Start development server"
    echo "  clean         Clean build artifacts and node_modules"
    echo "  install       Install dependencies"
    echo "  backup-db     Backup database"
    echo "  restore-db    Restore database from backup"
    echo "  health-check  Run health checks"
    echo "  all           Run lint, test, and build"
    echo ""
}

# Function to run ESLint
run_lint() {
    print_status "Running ESLint..."
    if npx eslint src --ext .ts,.tsx --max-warnings 0; then
        print_success "ESLint passed with no issues"
    else
        print_error "ESLint found issues"
        return 1
    fi
}

# Function to run ESLint with auto-fix
run_lint_fix() {
    print_status "Running ESLint with auto-fix..."
    npx eslint src --ext .ts,.tsx --fix
    print_success "ESLint auto-fix completed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    if npm test; then
        print_success "All tests passed"
    else
        print_error "Some tests failed"
        return 1
    fi
}

# Function to build the application
run_build() {
    print_status "Building application..."
    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        return 1
    fi
}

# Function to start development server
run_dev() {
    print_status "Starting development server..."
    npm run dev
}

# Function to clean build artifacts
run_clean() {
    print_status "Cleaning build artifacts..."
    rm -rf dist build .next node_modules/.cache
    print_success "Build artifacts cleaned"
}

# Function to install dependencies
run_install() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
}

# Function to backup database
run_backup_db() {
    print_status "Backing up database..."
    if [ -f "scripts/backup-database.sh" ]; then
        bash scripts/backup-database.sh
        print_success "Database backup completed"
    else
        print_error "Backup script not found"
        return 1
    fi
}

# Function to restore database
run_restore_db() {
    print_status "Restoring database..."
    if [ -f "scripts/restore-database.sh" ]; then
        bash scripts/restore-database.sh
        print_success "Database restored"
    else
        print_error "Restore script not found"
        return 1
    fi
}

# Function to run health checks
run_health_check() {
    print_status "Running health checks..."
    if [ -f "scripts/health-check.sh" ]; then
        bash scripts/health-check.sh
        print_success "Health checks completed"
    else
        print_error "Health check script not found"
        return 1
    fi
}

# Function to run all checks
run_all() {
    print_status "Running comprehensive checks..."
    
    if run_lint && run_tests && run_build; then
        print_success "All checks passed successfully!"
    else
        print_error "Some checks failed"
        return 1
    fi
}

# Main script logic
case "${1:-}" in
    "lint")
        run_lint
        ;;
    "lint-fix")
        run_lint_fix
        ;;
    "test")
        run_tests
        ;;
    "build")
        run_build
        ;;
    "dev")
        run_dev
        ;;
    "clean")
        run_clean
        ;;
    "install")
        run_install
        ;;
    "backup-db")
        run_backup_db
        ;;
    "restore-db")
        run_restore_db
        ;;
    "health-check")
        run_health_check
        ;;
    "all")
        run_all
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
