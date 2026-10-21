#!/bin/bash

###############################################################################
# Build Health Monitor Script
# Monitors NestJS build logs and identifies issues
###############################################################################

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           BUILD HEALTH MONITOR - The Beach Project            ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
    echo "─────────────────────────────────────────────────────────────"
}

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
        return 0
    else
        echo -e "${RED}✗ $1${NC}"
        return 1
    fi
}

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

###############################################################################
# 1. Check Node.js and npm versions
###############################################################################
print_section "System Environment"

echo -n "Node.js: "
node --version
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
PASSED_CHECKS=$((PASSED_CHECKS + 1))

echo -n "npm: "
npm --version
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
PASSED_CHECKS=$((PASSED_CHECKS + 1))

###############################################################################
# 2. Check package.json dependencies
###############################################################################
print_section "Dependency Check"

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✓ node_modules directory exists${NC}"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗ node_modules directory missing${NC}"
        echo -e "${YELLOW}  Run: npm install${NC}"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
else
    echo -e "${RED}✗ package.json not found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

###############################################################################
# 3. Check TypeScript Configuration
###############################################################################
print_section "TypeScript Configuration"

if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓ tsconfig.json found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ tsconfig.json missing${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

if [ -f "tsconfig.build.json" ]; then
    echo -e "${GREEN}✓ tsconfig.build.json found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠ tsconfig.build.json missing${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

###############################################################################
# 4. Run TypeScript Compilation Check
###############################################################################
print_section "TypeScript Compilation"

echo "Running: npx tsc --noEmit"
echo ""

if npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.log; then
    echo -e "\n${GREEN}✓ TypeScript compilation successful${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "\n${RED}✗ TypeScript compilation failed${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    
    # Show detailed errors
    echo -e "\n${RED}Compilation Errors:${NC}"
    cat /tmp/tsc-output.log | grep "error TS" | head -10
    
    ERROR_COUNT=$(cat /tmp/tsc-output.log | grep -c "error TS" || echo "0")
    echo -e "\n${RED}Total TypeScript Errors: $ERROR_COUNT${NC}"
fi

###############################################################################
# 5. Check for Missing Dependencies
###############################################################################
print_section "Missing Imports Check"

echo "Scanning for missing module imports..."
MISSING_MODULES=$(npx tsc --noEmit 2>&1 | grep "Cannot find module" | sed "s/.*Cannot find module '\(.*\)'.*/\1/" | sort | uniq)

if [ -z "$MISSING_MODULES" ]; then
    echo -e "${GREEN}✓ No missing modules detected${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ Missing modules detected:${NC}"
    echo "$MISSING_MODULES" | while read module; do
        echo -e "  ${RED}→${NC} $module"
    done
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

###############################################################################
# 6. Check NestJS Configuration
###############################################################################
print_section "NestJS Configuration"

if [ -f "nest-cli.json" ]; then
    echo -e "${GREEN}✓ nest-cli.json found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ nest-cli.json missing${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for main.ts
if [ -f "src/main.ts" ]; then
    echo -e "${GREEN}✓ src/main.ts found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ src/main.ts missing${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Check for app.module.ts
if [ -f "src/app.module.ts" ]; then
    echo -e "${GREEN}✓ src/app.module.ts found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ src/app.module.ts missing${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

###############################################################################
# 7. Check Source Files
###############################################################################
print_section "Source Files Inventory"

if [ -d "src" ]; then
    TS_FILES=$(find src -name "*.ts" | wc -l)
    echo -e "TypeScript files: ${BLUE}$TS_FILES${NC}"
    
    CONTROLLER_FILES=$(find src -name "*.controller.ts" | wc -l)
    echo -e "Controllers: ${BLUE}$CONTROLLER_FILES${NC}"
    
    SERVICE_FILES=$(find src -name "*.service.ts" | wc -l)
    echo -e "Services: ${BLUE}$SERVICE_FILES${NC}"
    
    MODULE_FILES=$(find src -name "*.module.ts" | wc -l)
    echo -e "Modules: ${BLUE}$MODULE_FILES${NC}"
    
    GATEWAY_FILES=$(find src -name "*.gateway.ts" | wc -l)
    echo -e "Gateways: ${BLUE}$GATEWAY_FILES${NC}"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${RED}✗ src directory not found${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

###############################################################################
# 8. Check for Circular Dependencies
###############################################################################
print_section "Circular Dependencies Check"

if command -v madge &> /dev/null; then
    echo "Running madge circular dependency check..."
    if madge --circular --extensions ts src/ 2>&1 | tee /tmp/madge-output.log; then
        echo -e "${GREEN}✓ No circular dependencies found${NC}"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠ Circular dependencies detected${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ madge not installed (optional check)${NC}"
    echo -e "  Install with: npm install -g madge"
fi

###############################################################################
# 9. Check Build Output
###############################################################################
print_section "Build Output Check"

if [ -d "dist" ]; then
    JS_FILES=$(find dist -name "*.js" 2>/dev/null | wc -l)
    if [ "$JS_FILES" -gt 0 ]; then
        echo -e "${GREEN}✓ dist directory exists with $JS_FILES compiled files${NC}"
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${YELLOW}⚠ dist directory exists but is empty${NC}"
        echo -e "  Run: npm run build"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ dist directory not found${NC}"
    echo -e "  Run: npm run build"
    WARNINGS=$((WARNINGS + 1))
fi

###############################################################################
# 10. Check for Common Issues
###############################################################################
print_section "Common Issues Check"

# Check for package-lock.json
if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✓ package-lock.json exists${NC}"
else
    echo -e "${YELLOW}⚠ package-lock.json missing${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for .env file
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}⚠ .env file missing (may be intentional)${NC}"
fi

# Check for node version compatibility
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓ Node.js version compatible (v$NODE_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ Node.js version may be too old (v$NODE_VERSION)${NC}"
    echo -e "  Recommended: Node.js 18 or higher"
    WARNINGS=$((WARNINGS + 1))
fi

###############################################################################
# 11. Try a Test Build
###############################################################################
print_section "Test Build Attempt"

echo "Attempting test build (this may take a moment)..."
if timeout 30 npm run build 2>&1 | tail -20; then
    echo -e "\n${GREEN}✓ Test build completed successfully${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "\n${RED}✗ Test build failed or timed out${NC}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

###############################################################################
# FINAL REPORT
###############################################################################
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                      HEALTH REPORT SUMMARY                     ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "Total Checks: ${BLUE}$TOTAL_CHECKS${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

PASS_RATE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
echo ""
echo -e "Pass Rate: ${BLUE}$PASS_RATE%${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║               ✓ BUILD HEALTH: EXCELLENT                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Server is ready to start!${NC}"
    echo -e "Run: ${BLUE}npm run start:dev${NC}"
    exit 0
elif [ $FAILED_CHECKS -lt 3 ]; then
    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║               ⚠ BUILD HEALTH: GOOD (Minor Issues)            ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Server may start with warnings. Review issues above.${NC}"
    exit 1
else
    echo ""
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║               ✗ BUILD HEALTH: CRITICAL ISSUES                ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${RED}Server cannot start. Fix critical issues above.${NC}"
    echo ""
    echo -e "${YELLOW}Quick Fixes:${NC}"
    echo -e "  1. Run: ${BLUE}npm install${NC}"
    echo -e "  2. Check TypeScript errors above"
    echo -e "  3. Fix missing module imports"
    echo -e "  4. Run: ${BLUE}npm run build${NC}"
    exit 2
fi
