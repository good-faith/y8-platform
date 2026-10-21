#!/bin/bash

# 🚀 Put The Beach Apps to Work!
# This script starts the server and assigns PKP tasks

set -e

echo "═══════════════════════════════════════════════════════════"
echo "🚀 Starting The Beach - Autonomous Development System"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Navigate to project
cd /home/goodfaith/projects/xr/babylon

echo "📦 Installing dependencies..."
npm install --silent 2>&1 | tail -5

echo ""
echo "🔨 Building project..."
npm run build 2>&1 | tail -10

echo ""
echo "🚀 Starting server in background..."
nohup npm run start:prod > logs/server.log 2>&1 &
SERVER_PID=$!
echo "   Server PID: $SERVER_PID"

echo ""
echo "⏳ Waiting for server to start (15 seconds)..."
sleep 15

echo ""
echo "🏥 Health check..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Server is running!"
else
    echo "   ⚠️  Server may still be starting..."
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "📊 PKP Dashboard"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Show dashboard
node scripts/pkp-task-manager.js dashboard

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🤖 Assigning PKP Tasks - Week 1 Sprint"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "📝 Task #1: Y8 App Playwright Setup (PKP_TestRunner)"
echo "   Priority: 🔴 HIGH"
echo "   Time: 4 hours"
echo "   Status: Assigning..."

# Assign Task 1
node scripts/pkp-task-manager.js assign 1

echo ""
echo "📝 Task #5: Automated Security Scanning (PKP_SecurityAuditor)"
echo "   Priority: 🔴 HIGH"
echo "   Time: 12 hours"
echo "   Status: Assigning..."

# Assign Task 5
node scripts/pkp-task-manager.js assign 5

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Apps Are Now Working!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🤖 Active PKP Agents:"
echo "   • PKP_TestRunner      → Working on Task #1"
echo "   • PKP_SecurityAuditor → Working on Task #5"
echo ""
echo "📊 Monitor Progress:"
echo "   node scripts/pkp-task-manager.js list-tasks"
echo "   node scripts/pkp-task-manager.js dashboard"
echo ""
echo "🌐 API Endpoints:"
echo "   http://localhost:3000/npe/team"
echo "   http://localhost:3000/npe/pkp/dashboard"
echo "   http://localhost:3000/npe/pkp/tasks"
echo ""
echo "📝 View Logs:"
echo "   tail -f logs/server.log"
echo ""
echo "🎉 Week 1 Sprint Started: 2 tasks (16 hours) in progress!"
echo ""
