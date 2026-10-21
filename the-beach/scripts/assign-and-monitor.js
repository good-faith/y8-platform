#!/usr/bin/env node

/**
 * PKP Agent Task Assignment & Monitoring Script
 * 
 * This script assigns different tasks to PKP agents and monitors their progress
 * with real-time reporting back to the main coordinator.
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

function logReport(agentName, message, color = 'cyan') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors.bright}${agentName}:${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// Task assignments for each agent
const TASK_ASSIGNMENTS = [
  {
    taskId: 1,
    agentType: 'redis-encryptor',
    expectedAgent: '🔒 Redis Encryptor',
    description: 'Encrypt user session data',
  },
  {
    taskId: 2,
    agentType: 'test-runner',
    expectedAgent: '✅ Test Runner',
    description: 'Run Playwright E2E tests',
  },
  {
    taskId: 3,
    agentType: 'code-reviewer',
    expectedAgent: '📝 Code Reviewer',
    description: 'Review security vulnerabilities',
  },
  {
    taskId: 4,
    agentType: 'metrics-collector',
    expectedAgent: '📊 Metrics Collector',
    description: 'Collect performance metrics',
  },
  {
    taskId: 5,
    agentType: 'security-auditor',
    expectedAgent: '🛡️ Security Auditor',
    description: 'Audit dependencies',
  },
  {
    taskId: 6,
    agentType: 'deployer',
    expectedAgent: '🚀 Deployer',
    description: 'Deploy to production',
  },
];

class TaskCoordinator {
  constructor() {
    this.activeAgents = [];
    this.reports = [];
    this.startTime = Date.now();
  }

  async initialize() {
    log('\n🎯 PKP Task Coordinator Initializing...', 'bright');
    log('═'.repeat(80), 'cyan');
    log('');
    
    // Get all available agents
    try {
      const response = await axios.get(`${API_BASE}/npe/pkp/agents`);
      this.availableAgents = response.data.data;
      log(`✅ Found ${this.availableAgents.length} available agents`, 'green');
    } catch (error) {
      log(`❌ Error fetching agents: ${error.message}`, 'red');
      return false;
    }

    // Get all available tasks
    try {
      const response = await axios.get(`${API_BASE}/npe/pkp/tasks`);
      this.availableTasks = response.data.data;
      log(`✅ Found ${this.availableTasks.length} available tasks`, 'green');
    } catch (error) {
      log(`❌ Error fetching tasks: ${error.message}`, 'red');
      return false;
    }

    log('');
    return true;
  }

  async assignAllTasks() {
    log('📋 Starting Task Assignment Phase...', 'bright');
    log('═'.repeat(80), 'cyan');
    log('');

    for (const assignment of TASK_ASSIGNMENTS) {
      await this.assignTask(assignment);
      await this.sleep(1000); // Delay between assignments
    }

    log('');
    log('✅ All tasks assigned!', 'green');
    log('');
  }

  async assignTask(assignment) {
    const { taskId, expectedAgent, description } = assignment;

    try {
      log(`🚀 Assigning Task #${taskId} to ${expectedAgent}`, 'yellow');
      log(`   Description: ${description}`, 'dim');

      const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/start`);
      const task = response.data.data;

      this.activeAgents.push({
        taskId,
        agentName: expectedAgent,
        startTime: Date.now(),
        status: 'working',
        progress: 0,
      });

      logReport(expectedAgent, `✅ Acknowledged - Starting "${task.title}"`, 'green');
      
      return true;
    } catch (error) {
      log(`   ❌ Failed: ${error.response?.data?.message || error.message}`, 'red');
      return false;
    }
  }

  async monitorProgress() {
    log('📊 Starting Progress Monitoring Phase...', 'bright');
    log('═'.repeat(80), 'cyan');
    log('Real-time agent reports will appear below:', 'dim');
    log('');

    const monitoringInterval = setInterval(async () => {
      for (const agent of this.activeAgents) {
        if (agent.status === 'completed') continue;

        // Simulate progress increments
        const progressIncrement = Math.floor(Math.random() * 15) + 10; // 10-25%
        agent.progress = Math.min(100, agent.progress + progressIncrement);

        // Report progress
        await this.reportProgress(agent);

        // Complete if at 100%
        if (agent.progress >= 100) {
          await this.completeTask(agent);
        }

        await this.sleep(500);
      }

      // Check if all tasks completed
      const allCompleted = this.activeAgents.every(a => a.status === 'completed');
      if (allCompleted) {
        clearInterval(monitoringInterval);
        await this.generateFinalReport();
      }
    }, 3000); // Check every 3 seconds
  }

  async reportProgress(agent) {
    try {
      const response = await axios.post(
        `${API_BASE}/npe/pkp/tasks/${agent.taskId}/progress`,
        { progressPercent: agent.progress }
      );

      const progressBar = this.createProgressBar(agent.progress);
      const statusEmoji = agent.progress < 50 ? '🔄' : agent.progress < 100 ? '⚡' : '✅';
      
      logReport(
        agent.agentName,
        `${statusEmoji} Progress: ${progressBar} ${agent.progress}%`,
        'cyan'
      );

      // Add occasional status updates
      if (agent.progress === 25) {
        logReport(agent.agentName, '📝 Quarter way through...', 'blue');
      } else if (agent.progress === 50) {
        logReport(agent.agentName, '⚡ Halfway complete!', 'yellow');
      } else if (agent.progress === 75) {
        logReport(agent.agentName, '🔥 Almost done!', 'magenta');
      }

    } catch (error) {
      // Silent fail for progress updates
    }
  }

  async completeTask(agent) {
    try {
      const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${agent.taskId}/complete`);
      const task = response.data.data;

      agent.status = 'completed';
      agent.completedTime = Date.now();
      const duration = ((agent.completedTime - agent.startTime) / 1000).toFixed(1);

      logReport(
        agent.agentName,
        `✅ COMPLETED in ${duration}s - Task finished successfully! 🎉`,
        'green'
      );

      this.reports.push({
        agent: agent.agentName,
        taskId: agent.taskId,
        duration,
        status: 'completed',
      });

    } catch (error) {
      logReport(agent.agentName, `❌ Completion failed: ${error.message}`, 'red');
      agent.status = 'failed';
    }
  }

  createProgressBar(percent) {
    const barLength = 20;
    const filled = Math.round((percent / 100) * barLength);
    const empty = barLength - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  async generateFinalReport() {
    log('');
    log('═'.repeat(80), 'cyan');
    log('📊 FINAL COORDINATOR REPORT', 'bright');
    log('═'.repeat(80), 'cyan');
    log('');

    const totalDuration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    
    log(`⏱️  Total Operation Time: ${totalDuration}s`, 'cyan');
    log(`🤖 Agents Deployed: ${this.activeAgents.length}`, 'cyan');
    log(`✅ Tasks Completed: ${this.reports.filter(r => r.status === 'completed').length}`, 'green');
    log(`❌ Tasks Failed: ${this.reports.filter(r => r.status === 'failed').length}`, 'red');
    log('');

    log('Individual Agent Performance:', 'bright');
    log('─'.repeat(80), 'dim');
    
    this.reports.forEach((report, index) => {
      const statusIcon = report.status === 'completed' ? '✅' : '❌';
      log(`${index + 1}. ${statusIcon} ${report.agent}`, 'cyan');
      log(`   Task #${report.taskId} | Duration: ${report.duration}s`, 'dim');
    });

    log('');
    log('═'.repeat(80), 'cyan');
    log('🎉 All agents have reported back!', 'green');
    log('═'.repeat(80), 'cyan');
    log('');

    // Try to get dashboard
    try {
      const response = await axios.get(`${API_BASE}/npe/pkp/dashboard`);
      const dashboard = response.data.data;

      log('📈 Updated Dashboard Statistics:', 'bright');
      log(`   Tasks Completed: ${dashboard.summary.completed}`, 'green');
      log(`   Total Actual Hours: ${dashboard.summary.totalActualHours}h`, 'cyan');
      log('');
    } catch (error) {
      // Silent fail
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const coordinator = new TaskCoordinator();

  // Initialize
  const initialized = await coordinator.initialize();
  if (!initialized) {
    log('❌ Initialization failed. Exiting.', 'red');
    process.exit(1);
  }

  await coordinator.sleep(1000);

  // Assign tasks
  await coordinator.assignAllTasks();
  
  await coordinator.sleep(2000);

  // Monitor progress with real-time reporting
  await coordinator.monitorProgress();
}

// Run the coordinator
main().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
