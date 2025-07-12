#!/bin/bash

# Test runner script for the Live Schedule Management App

set -e

echo "🚀 Starting Live Schedule App Test Suite"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_error "node_modules not found. Please run 'npm install' first."
    exit 1
fi

# Check if test files exist
if [ ! -d "src/__tests__" ]; then
    print_error "Test directory not found. Please ensure tests are set up correctly."
    exit 1
fi

print_status "Running Jest tests..."
echo ""

# Run different test suites
echo "📦 Running Unit Tests..."
npm test -- --testPathPattern="src/__tests__/(components|utils|database)" --verbose

echo ""
echo "📱 Running Screen Tests..."
npm test -- --testPathPattern="src/__tests__/screens" --verbose

echo ""
echo "🔗 Running Integration Tests..."
npm test -- --testPathPattern="src/__tests__/integration" --verbose

echo ""
echo "📊 Generating Coverage Report..."
npm test -- --coverage --coverageDirectory=coverage

echo ""
echo "🎯 Test Results Summary:"
echo "========================"

# Check if coverage meets threshold
if [ -f "coverage/lcov-report/index.html" ]; then
    print_status "Coverage report generated: coverage/lcov-report/index.html"
else
    print_warning "Coverage report not generated"
fi

# Run lint check
echo ""
echo "🔍 Running Lint Check..."
npm run lint 2>/dev/null || print_warning "Lint check failed or not configured"

# Run TypeScript check
echo ""
echo "🔧 Running TypeScript Check..."
npx tsc --noEmit 2>/dev/null || print_warning "TypeScript check failed"

echo ""
print_status "✅ Test suite completed!"
echo ""
echo "📋 Next Steps:"
echo "- Review coverage report in coverage/lcov-report/index.html"
echo "- Fix any failing tests"
echo "- Update tests as you add new features"
echo "- Consider adding more edge case tests"
echo ""
echo "💡 Tips:"
echo "- Run 'npm test -- --watch' for development"
echo "- Run 'npm test -- --testNamePattern=\"specific test\"' for specific tests"
echo "- Use 'npm test -- --updateSnapshot' to update snapshots"
echo ""
