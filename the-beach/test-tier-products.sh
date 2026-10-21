#!/bin/bash

# Tier Products API Test Script
# Tests all tier product endpoints

API_BASE="http://localhost:3000"
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Tier Products API${NC}\n"

# Function to make API call and pretty print
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "${BLUE}${method} ${endpoint}${NC}"
    
    response=$(curl -s -X ${method} "${API_BASE}${endpoint}")
    
    if [ $? -eq 0 ]; then
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo -e "${GREEN}✅ Success${NC}\n"
    else
        echo -e "${RED}❌ Failed${NC}\n"
    fi
}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}1. Get All Products${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products" "Get all tier products with comparison"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}2. Get Individual Tier Products${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/freemium" "Get Freemium tier product"
test_endpoint "GET" "/npe/products/base" "Get Basic tier product"
test_endpoint "GET" "/npe/products/premium" "Get Professional tier product"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}3. Pricing Information${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/pricing/comparison" "Get pricing comparison across tiers"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}4. Feature Comparisons${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/features/comparison" "Get all features comparison"
test_endpoint "GET" "/npe/products/features/comparison?category=agents" "Get agents features comparison"
test_endpoint "GET" "/npe/products/features/comparison?category=customization" "Get customization features"
test_endpoint "GET" "/npe/products/features/comparison?category=integration" "Get integration features"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}5. Add-ons${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/freemium/addons" "Get Freemium available add-ons"
test_endpoint "GET" "/npe/products/base/addons" "Get Basic available add-ons"
test_endpoint "GET" "/npe/products/premium/addons" "Get Professional available add-ons"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}6. Price Calculations${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/base/calculate" "Calculate Basic base price"
test_endpoint "GET" "/npe/products/base/calculate?addons=extra-npes-10" "Calculate Basic + 10 extra agents"
test_endpoint "GET" "/npe/products/base/calculate?addons=extra-npes-10,priority-support" "Calculate Basic + multiple add-ons"
test_endpoint "GET" "/npe/products/premium/calculate?addons=sla-guarantee" "Calculate Professional + SLA"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}7. Features by Category${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/base/features/agents" "Get Basic agent features"
test_endpoint "GET" "/npe/products/premium/features/security" "Get Professional security features"
test_endpoint "GET" "/npe/products/freemium/features/support" "Get Freemium support features"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}8. Quotas${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/freemium/quotas" "Get Freemium quotas"
test_endpoint "GET" "/npe/products/base/quotas" "Get Basic quotas"
test_endpoint "GET" "/npe/products/premium/quotas" "Get Professional quotas"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}9. Marketing Information${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/freemium/marketing" "Get Freemium marketing info"
test_endpoint "GET" "/npe/products/base/marketing" "Get Basic marketing info"
test_endpoint "GET" "/npe/products/premium/marketing" "Get Professional marketing info"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}10. Feature Categories${NC}"
echo -e "${BLUE}================================${NC}\n"
test_endpoint "GET" "/npe/products/categories/list" "Get all feature categories"

echo -e "\n${GREEN}🎉 All tests completed!${NC}\n"

# Summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}API Endpoint Summary${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "📦 ${GREEN}Products:${NC}"
echo -e "   GET /npe/products"
echo -e "   GET /npe/products/:tier"
echo -e ""
echo -e "💰 ${GREEN}Pricing:${NC}"
echo -e "   GET /npe/products/pricing/comparison"
echo -e "   GET /npe/products/:tier/calculate?addons=..."
echo -e ""
echo -e "🔍 ${GREEN}Features:${NC}"
echo -e "   GET /npe/products/features/comparison?category=..."
echo -e "   GET /npe/products/:tier/features/:category"
echo -e ""
echo -e "🧩 ${GREEN}Add-ons:${NC}"
echo -e "   GET /npe/products/:tier/addons"
echo -e ""
echo -e "📊 ${GREEN}Details:${NC}"
echo -e "   GET /npe/products/:tier/quotas"
echo -e "   GET /npe/products/:tier/marketing"
echo -e "   GET /npe/products/categories/list"
echo -e ""

echo -e "${YELLOW}Tiers:${NC} freemium, base, premium"
echo -e "${YELLOW}Categories:${NC} agents, customization, geography, automation, support, integration, analytics, networking, security, performance"
echo -e ""
