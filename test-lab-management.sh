#!/bin/bash

# Lab Management Test Suite Runner
# This script runs all tests for the Lab Management modules

echo "🧪 Running Lab Management Test Suite"
echo "=================================="

# Set test environment
export NODE_ENV=test

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "\n${BLUE}Running $test_name...${NC}"
    
    if [ -f "$test_file" ]; then
        if npm test -- "$test_file" --passWithNoTests; then
            echo -e "${GREEN}✅ $test_name PASSED${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}❌ $test_name FAILED${NC}"
            ((FAILED_TESTS++))
        fi
    else
        echo -e "${YELLOW}⚠️  $test_name - File not found${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Function to run tests with coverage
run_test_with_coverage() {
    local test_file=$1
    local test_name=$2
    
    echo -e "\n${BLUE}Running $test_name with coverage...${NC}"
    
    if [ -f "$test_file" ]; then
        if npm test -- "$test_file" --coverage --passWithNoTests; then
            echo -e "${GREEN}✅ $test_name PASSED with coverage${NC}"
            ((PASSED_TESTS++))
        else
            echo -e "${RED}❌ $test_name FAILED${NC}"
            ((FAILED_TESTS++))
        fi
    else
        echo -e "${YELLOW}⚠️  $test_name - File not found${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

echo -e "\n${BLUE}Starting Lab Management Test Suite${NC}"
echo "=================================="

# Run individual component tests
echo -e "\n${YELLOW}📦 Component Tests${NC}"
echo "----------------"

run_test "src/tests/lab-management/LabInventoryManager.test.tsx" "Lab Inventory Manager Tests"
run_test "src/tests/lab-management/EquipmentManager.test.tsx" "Equipment Manager Tests"
run_test "src/tests/lab-management/QualityControl.test.tsx" "Quality Control Tests"

# Run integration tests
echo -e "\n${YELLOW}🔗 Integration Tests${NC}"
echo "-------------------"

run_test "src/tests/lab-management/LaboratoryManagement.integration.test.tsx" "Laboratory Management Integration Tests"

# Run all tests together
echo -e "\n${YELLOW}🎯 Full Test Suite${NC}"
echo "-----------------"

echo -e "\n${BLUE}Running all lab management tests together...${NC}"
if npm test -- "src/tests/lab-management/" --passWithNoTests; then
    echo -e "${GREEN}✅ All Lab Management Tests PASSED${NC}"
else
    echo -e "${RED}❌ Some Lab Management Tests FAILED${NC}"
fi

# Run with coverage if requested
if [ "$1" = "--coverage" ]; then
    echo -e "\n${YELLOW}📊 Coverage Report${NC}"
    echo "----------------"
    
    echo -e "\n${BLUE}Running tests with coverage...${NC}"
    npm test -- "src/tests/lab-management/" --coverage --passWithNoTests
    
    echo -e "\n${GREEN}Coverage report generated in coverage/ directory${NC}"
fi

# Summary
echo -e "\n${BLUE}📋 Test Summary${NC}"
echo "==============="
echo -e "Total Tests: ${TOTAL_TESTS}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Lab Management modules are working correctly.${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the output above for details.${NC}"
    exit 1
fi
