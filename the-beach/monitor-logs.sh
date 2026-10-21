#!/bin/bash

###############################################################################
# Real-Time Build Log Monitor
# Continuously monitors NestJS server logs and health
###############################################################################

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           REAL-TIME BUILD LOG MONITOR                         ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if server is running
check_server() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to monitor compilation
monitor_compilation() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')] Starting compilation monitor...${NC}"
    echo ""
    
    # Start the server in background and capture output
    npm run start:dev 2>&1 | while IFS= read -r line; do
        # Color code different types of messages
        if echo "$line" | grep -q "error"; then
            echo -e "${RED}[$(date '+%H:%M:%S')] ERROR: $line${NC}"
        elif echo "$line" | grep -q "warn"; then
            echo -e "${YELLOW}[$(date '+%H:%M:%S')] WARN: $line${NC}"
        elif echo "$line" | grep -q "Starting compilation"; then
            echo -e "${CYAN}[$(date '+%H:%M:%S')] 🔄 $line${NC}"
        elif echo "$line" | grep -q "Found 0 errors"; then
            echo -e "${GREEN}[$(date '+%H:%M:%S')] ✅ $line${NC}"
        elif echo "$line" | grep -q "Listening on"; then
            echo -e "${GREEN}[$(date '+%H:%M:%S')] 🚀 $line${NC}"
            echo ""
            echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}            ✓ SERVER IS RUNNING SUCCESSFULLY!                  ${NC}"
            echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "Access points:"
            echo -e "  • API: ${BLUE}http://localhost:3000${NC}"
            echo -e "  • PKP Live Dashboard: ${BLUE}http://localhost:3000/pkp-live-dashboard.html${NC}"
            echo -e "  • VR Workers: ${BLUE}http://localhost:3000/pkp-workers-vr.html${NC}"
            echo -e "  • Health: ${BLUE}http://localhost:3000/health${NC}"
            echo ""
        elif echo "$line" | grep -q "Webpack"; then
            echo -e "${BLUE}[$(date '+%H:%M:%S')] 📦 $line${NC}"
        else
            echo -e "[$(date '+%H:%M:%S')] $line"
        fi
    done
}

# Trap Ctrl+C
trap 'echo -e "\n${YELLOW}Stopping monitor...${NC}"; exit 0' INT

# Run the monitor
monitor_compilation
