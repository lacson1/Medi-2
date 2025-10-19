#!/bin/bash

# Mobile-First PWA Testing Script
# This script runs comprehensive mobile tests for the MEDI 2 application

set -e

echo "🚀 Starting Mobile-First PWA Testing for MEDI 2"
echo "================================================"

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

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies if needed
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Dependencies installed"
    else
        print_status "Dependencies already installed"
    fi
}

# Run mobile-specific tests
run_mobile_tests() {
    print_status "Running mobile-specific tests..."
    
    # Run mobile navigation tests
    print_status "Testing mobile navigation..."
    npx playwright test --project="Mobile Chrome" --grep="Mobile Navigation"
    
    # Run mobile form tests
    print_status "Testing mobile forms..."
    npx playwright test --project="Mobile Safari" --grep="Mobile Forms"
    
    # Run mobile card tests
    print_status "Testing mobile cards..."
    npx playwright test --project="Mobile Chrome" --grep="Mobile Cards"
    
    # Run PWA tests
    print_status "Testing PWA features..."
    npx playwright test --project="PWA Mobile Chrome" --grep="PWA Features"
    
    # Run mobile performance tests
    print_status "Testing mobile performance..."
    npx playwright test --project="Performance Mobile" --grep="Mobile Performance"
    
    # Run mobile accessibility tests
    print_status "Testing mobile accessibility..."
    npx playwright test --project="Accessibility Mobile" --grep="Mobile Accessibility"
    
    # Run mobile gesture tests
    print_status "Testing mobile gestures..."
    npx playwright test --project="Mobile Chrome" --grep="Mobile Gestures"
    
    print_success "All mobile tests completed"
}

# Run PWA-specific tests
run_pwa_tests() {
    print_status "Running PWA-specific tests..."
    
    # Test service worker registration
    print_status "Testing service worker..."
    npx playwright test --project="PWA Chrome" --grep="service worker"
    
    # Test manifest
    print_status "Testing manifest..."
    npx playwright test --project="PWA Chrome" --grep="manifest"
    
    # Test offline functionality
    print_status "Testing offline functionality..."
    npx playwright test --project="PWA Mobile Chrome" --grep="offline"
    
    # Test push notifications
    print_status "Testing push notifications..."
    npx playwright test --project="PWA Chrome" --grep="notifications"
    
    print_success "All PWA tests completed"
}

# Run accessibility tests
run_accessibility_tests() {
    print_status "Running accessibility tests..."
    
    # Test screen reader support
    print_status "Testing screen reader support..."
    npx playwright test --project="Accessibility Chrome" --grep="screen readers"
    
    # Test keyboard navigation
    print_status "Testing keyboard navigation..."
    npx playwright test --project="Accessibility Mobile" --grep="keyboard"
    
    # Test high contrast mode
    print_status "Testing high contrast mode..."
    npx playwright test --project="Accessibility Chrome" --grep="high contrast"
    
    # Test reduced motion
    print_status "Testing reduced motion..."
    npx playwright test --project="Accessibility Mobile" --grep="reduced motion"
    
    print_success "All accessibility tests completed"
}

# Run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    # Test mobile performance
    print_status "Testing mobile performance..."
    npx playwright test --project="Performance Mobile" --grep="Performance"
    
    # Test slow connection handling
    print_status "Testing slow connection handling..."
    npx playwright test --project="Performance Mobile" --grep="slow connections"
    
    # Test image optimization
    print_status "Testing image optimization..."
    npx playwright test --project="Performance Mobile" --grep="images"
    
    print_success "All performance tests completed"
}

# Generate test report
generate_report() {
    print_status "Generating test report..."
    
    # Generate HTML report
    npx playwright show-report
    
    print_success "Test report generated"
}

# Run Lighthouse audit
run_lighthouse_audit() {
    print_status "Running Lighthouse audit..."
    
    # Install Lighthouse if not already installed
    if ! command -v lighthouse &> /dev/null; then
        npm install -g lighthouse
    fi
    
    # Start dev server in background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Run Lighthouse audit
    lighthouse http://localhost:5173 --output=html --output-path=./lighthouse-report.html --chrome-flags="--headless"
    
    # Stop dev server
    kill $DEV_PID
    
    print_success "Lighthouse audit completed. Report saved to lighthouse-report.html"
}

# Run all tests
run_all_tests() {
    print_status "Running all mobile-first PWA tests..."
    
    run_mobile_tests
    run_pwa_tests
    run_accessibility_tests
    run_performance_tests
    
    print_success "All tests completed successfully!"
}

# Main function
main() {
    case "${1:-all}" in
        "mobile")
            check_dependencies
            install_dependencies
            run_mobile_tests
            ;;
        "pwa")
            check_dependencies
            install_dependencies
            run_pwa_tests
            ;;
        "accessibility")
            check_dependencies
            install_dependencies
            run_accessibility_tests
            ;;
        "performance")
            check_dependencies
            install_dependencies
            run_performance_tests
            ;;
        "lighthouse")
            check_dependencies
            install_dependencies
            run_lighthouse_audit
            ;;
        "report")
            generate_report
            ;;
        "all")
            check_dependencies
            install_dependencies
            run_all_tests
            generate_report
            ;;
        *)
            echo "Usage: $0 [mobile|pwa|accessibility|performance|lighthouse|report|all]"
            echo ""
            echo "Options:"
            echo "  mobile        Run mobile-specific tests"
            echo "  pwa           Run PWA-specific tests"
            echo "  accessibility Run accessibility tests"
            echo "  performance   Run performance tests"
            echo "  lighthouse    Run Lighthouse audit"
            echo "  report        Generate test report"
            echo "  all           Run all tests (default)"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
