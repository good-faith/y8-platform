#!/bin/bash

# 🤖 PKP Agent Startup - Assign Tasks and Start Work
# Run this after the server is started

echo "═══════════════════════════════════════════════════════════"
echo "🤖 PKP Agent Work Assignment System"
echo "═══════════════════════════════════════════════════════════"
echo ""

cd /home/goodfaith/projects/xr/babylon

# Check if server is running
echo "🏥 Checking server status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Server is running!"
else
    echo "   ⚠️  Server not responding. Please start with: npm run start:dev"
    echo ""
    echo "   Then run this script again."
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 Current PKP Status"
echo "═══════════════════════════════════════════════════════════"

# Show current dashboard
node scripts/pkp-task-manager.js dashboard

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🚀 Week 1 Sprint - Assigning High Priority Tasks"
echo "═══════════════════════════════════════════════════════════"
echo ""

read -p "Assign Task #1 (Playwright Setup, 4h)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Assigning Task #1 to PKP_TestRunner..."
    node scripts/pkp-task-manager.js assign 1
    echo ""
fi

read -p "Assign Task #5 (Security Scanning, 12h)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Assigning Task #5 to PKP_SecurityAuditor..."
    node scripts/pkp-task-manager.js assign 5
    echo ""
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ PKP Agents Are Working!"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Show updated dashboard
node scripts/pkp-task-manager.js list-tasks

echo ""
echo "📊 Monitor Progress:"
echo "   node scripts/pkp-task-manager.js dashboard"
echo ""
echo "🌐 View in Browser:"
echo "   http://localhost:3000/npe/pkp/dashboard"
echo ""
echo "🎉 Apps are now working autonomously!"
echo ""
