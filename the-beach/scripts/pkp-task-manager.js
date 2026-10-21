#!/usr/bin/env node

/**
 * PKP Task Assignment CLI
 * 
 * Command-line tool for managing PKP (Programmable Key Pair) agent tasks
 * 
 * Usage:
 *   node scripts/pkp-task-manager.js <command> [options]
 * 
 * Commands:
 *   list-tasks              List all tasks
 *   list-agents             List all agents
 *   assign <taskId>         Assign and start a task
 *   progress <taskId> <pct> Update task progress
 *   complete <taskId>       Mark task as complete
 *   dashboard               Show PKP dashboard
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatPriority(priority) {
  const icons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };
  return `${icons[priority]} ${priority.toUpperCase()}`;
}

function formatStatus(status) {
  const icons = {
    not_started: '⚪',
    in_progress: '🔄',
    blocked: '🚫',
    completed: '✅',
    failed: '❌',
  };
  return `${icons[status]} ${status.replace('_', ' ').toUpperCase()}`;
}

async function listTasks() {
  try {
    log('\n📋 PKP Tasks\n', 'bright');
    
    const response = await axios.get(`${API_BASE}/npe/pkp/tasks`);
    const tasks = response.data.data;

    if (tasks.length === 0) {
      log('No tasks found', 'yellow');
      return;
    }

    tasks.forEach((task) => {
      log(`\nTask #${task.id}: ${task.title}`, 'cyan');
      log(`  Status: ${formatStatus(task.status)}`);
      log(`  Priority: ${formatPriority(task.priority)}`);
      log(`  Agent: ${task.assignedAgent}`);
      log(`  Repository: ${task.repository}`);
      log(`  Estimated: ${task.estimatedHours}h`);
      if (task.actualHours) {
        log(`  Actual: ${task.actualHours}h`);
      }
      if (task.progressPercent > 0) {
        log(`  Progress: ${task.progressPercent}%`, 'green');
      }
      if (task.blockers.length > 0) {
        log(`  Blockers: ${task.blockers.join(', ')}`, 'red');
      }
    });

    log(`\nTotal: ${tasks.length} tasks\n`, 'bright');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
}

async function listAgents() {
  try {
    log('\n🤖 PKP Agents\n', 'bright');
    
    const response = await axios.get(`${API_BASE}/npe/pkp/agents`);
    const agents = response.data.data;

    if (agents.length === 0) {
      log('No agents found', 'yellow');
      return;
    }

    agents.forEach((agent) => {
      const statusIcon = agent.status === 'active' ? '🟢' : '⚪';
      log(`\n${statusIcon} ${agent.name}`, 'cyan');
      log(`  Type: ${agent.type}`);
      log(`  Status: ${agent.status}`);
      log(`  Tasks Completed: ${agent.tasksCompleted}`);
      log(`  Total Hours: ${agent.totalHours}h`);
      log(`  Success Rate: ${agent.successRate}%`);
      if (agent.currentTask) {
        log(`  Current Task: #${agent.currentTask}`, 'yellow');
      }
      log(`  Capabilities:`);
      agent.capabilities.forEach((cap) => {
        log(`    • ${cap}`);
      });
    });

    log(`\nTotal: ${agents.length} agents\n`, 'bright');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
}

async function assignTask(taskId) {
  try {
    log(`\n🚀 Starting Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/start`);
    const task = response.data.data;

    log(`✅ Task started successfully!`, 'green');
    log(`\nTask #${task.id}: ${task.title}`, 'cyan');
    log(`  Status: ${formatStatus(task.status)}`);
    log(`  Agent: ${task.assignedAgent}`);
    log(`  Started: ${new Date(task.startedAt).toLocaleString()}`);
    log(`\nThe ${task.assignedAgent} is now working on this task!\n`);
  } catch (error) {
    log(`Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

async function updateProgress(taskId, progressPercent) {
  try {
    log(`\n📊 Updating Task #${taskId} Progress...\n`, 'bright');
    
    const response = await axios.post(
      `${API_BASE}/npe/pkp/tasks/${taskId}/progress`,
      { progressPercent: parseInt(progressPercent, 10) }
    );
    const task = response.data.data;

    log(`✅ Progress updated!`, 'green');
    log(`\nTask #${task.id}: ${task.title}`, 'cyan');
    log(`  Progress: ${task.progressPercent}%`, 'green');
    
    // Show progress bar
    const barLength = 20;
    const filled = Math.round((task.progressPercent / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    log(`  [${bar}] ${task.progressPercent}%\n`);
  } catch (error) {
    log(`Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

async function completeTask(taskId) {
  try {
    log(`\n🎉 Completing Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/complete`);
    const task = response.data.data;

    log(`✅ Task completed successfully!`, 'green');
    log(`\nTask #${task.id}: ${task.title}`, 'cyan');
    log(`  Status: ${formatStatus(task.status)}`);
    log(`  Completed: ${new Date(task.completedAt).toLocaleString()}`);
    if (task.actualHours) {
      const variance = task.actualHours - task.estimatedHours;
      const varianceText = variance > 0 
        ? `${variance.toFixed(1)}h over estimate` 
        : `${Math.abs(variance).toFixed(1)}h under estimate`;
      log(`  Time: ${task.actualHours}h (${varianceText})`);
    }
    log(`\nGreat work! 🎊\n`);
  } catch (error) {
    log(`Error: ${error.response?.data?.message || error.message}`, 'red');
  }
}

async function showDashboard() {
  try {
    log('\n📊 PKP Dashboard\n', 'bright');
    
    const response = await axios.get(`${API_BASE}/npe/pkp/dashboard`);
    const dashboard = response.data.data;

    // Summary
    log('═'.repeat(60), 'cyan');
    log('SUMMARY', 'bright');
    log('═'.repeat(60), 'cyan');
    log(`Total Tasks: ${dashboard.summary.totalTasks}`);
    log(`  ⚪ Not Started: ${dashboard.summary.notStarted}`);
    log(`  🔄 In Progress: ${dashboard.summary.inProgress}`);
    log(`  🚫 Blocked: ${dashboard.summary.blocked}`);
    log(`  ✅ Completed: ${dashboard.summary.completed}`);
    log(`  ❌ Failed: ${dashboard.summary.failed}`);
    log(`\nEstimated Hours: ${dashboard.summary.totalEstimatedHours}h`);
    log(`Actual Hours: ${dashboard.summary.totalActualHours}h\n`);

    // By Priority
    log('═'.repeat(60), 'cyan');
    log('BY PRIORITY', 'bright');
    log('═'.repeat(60), 'cyan');
    log(`🔴 High: ${dashboard.byPriority.high}`);
    log(`🟡 Medium: ${dashboard.byPriority.medium}`);
    log(`🟢 Low: ${dashboard.byPriority.low}\n`);

    // By Repository
    log('═'.repeat(60), 'cyan');
    log('BY REPOSITORY', 'bright');
    log('═'.repeat(60), 'cyan');
    log(`The Beach: ${dashboard.byRepository.theBeach}`);
    log(`Y8 App: ${dashboard.byRepository.y8App}`);
    log(`Both: ${dashboard.byRepository.both}\n`);

    // Agents
    log('═'.repeat(60), 'cyan');
    log('AGENTS', 'bright');
    log('═'.repeat(60), 'cyan');
    dashboard.agents.forEach((agent) => {
      const statusIcon = agent.status === 'active' ? '🟢' : '⚪';
      log(`${statusIcon} ${agent.name}`);
      log(`   Tasks: ${agent.tasksCompleted} | Hours: ${agent.totalHours}h | Success: ${agent.successRate}%`);
      if (agent.currentTask) {
        log(`   Currently working on: Task #${agent.currentTask}`, 'yellow');
      }
    });

    // Upcoming Tasks
    if (dashboard.upcomingTasks.length > 0) {
      log('\n═'.repeat(60), 'cyan');
      log('UPCOMING TASKS (Top 5)', 'bright');
      log('═'.repeat(60), 'cyan');
      dashboard.upcomingTasks.forEach((task, index) => {
        log(`${index + 1}. ${formatPriority(task.priority)} Task #${task.id}: ${task.title}`);
        log(`   Agent: ${task.assignedAgent} | Estimate: ${task.estimatedHours}h`);
      });
    }

    log('\n');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
  }
}

async function setGitBranch(taskId, branch, baseBranch = 'master') {
  try {
    log(`\n🌿 Setting Git branch for Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/git-context`, {
      branch,
      baseBranch,
    });

    if (response.data.success) {
      log(`✅ Git branch set successfully!\n`, 'green');
      log(`Task #${taskId}: ${response.data.data.title}`);
      log(`  Branch: ${colors.cyan}${branch}${colors.reset}`);
      log(`  Base Branch: ${baseBranch}`);
      log(`  Repository: ${response.data.data.repository}\n`);
    }
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function recordCommit(taskId, commitHash) {
  try {
    log(`\n📝 Recording commit for Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/commit`, {
      commitHash,
    });

    if (response.data.success) {
      const task = response.data.data;
      log(`✅ Commit recorded successfully!\n`, 'green');
      log(`Task #${taskId}: ${task.title}`);
      log(`  Commit: ${colors.cyan}${commitHash}${colors.reset}`);
      log(`  Branch: ${task.gitContext.branch}`);
      log(`  Total Commits: ${task.gitContext.commits.length}\n`);
    }
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function setPR(taskId, prUrl) {
  try {
    log(`\n🔗 Setting PR URL for Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/pr`, {
      prUrl,
    });

    if (response.data.success) {
      log(`✅ PR URL set successfully!\n`, 'green');
      log(`Task #${taskId}: ${response.data.data.title}`);
      log(`  PR: ${colors.cyan}${prUrl}${colors.reset}\n`);
    }
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function showTaskGitStatus(taskId) {
  try {
    const response = await axios.get(`${API_BASE}/npe/pkp/tasks/${taskId}`);
    const task = response.data.data;

    log(`\n📊 Git Status for Task #${taskId}\n`, 'bright');
    log(`Task: ${task.title}`, 'cyan');
    log(`Status: ${formatStatus(task.status)}`);
    
    if (task.gitContext) {
      log(`\n🌿 Git Context:`, 'bright');
      log(`  Branch: ${colors.cyan}${task.gitContext.branch}${colors.reset}`);
      log(`  Base Branch: ${task.gitContext.baseBranch || 'N/A'}`);
      
      if (task.gitContext.startCommit) {
        log(`  Start Commit: ${task.gitContext.startCommit}`);
      }
      if (task.gitContext.currentCommit) {
        log(`  Current Commit: ${colors.green}${task.gitContext.currentCommit}${colors.reset}`);
      }
      if (task.gitContext.commits && task.gitContext.commits.length > 0) {
        log(`  Total Commits: ${task.gitContext.commits.length}`);
        log(`\n  Recent Commits:`);
        task.gitContext.commits.slice(-5).forEach((commit, i) => {
          log(`    ${task.gitContext.commits.length - 4 + i}. ${commit}`);
        });
      }
      if (task.gitContext.pullRequestUrl) {
        log(`\n  PR: ${colors.cyan}${task.gitContext.pullRequestUrl}${colors.reset}`);
      }
    } else {
      log(`\n⚠️  No Git context set for this task`, 'yellow');
      log(`\nTo set a branch, run:`);
      log(`  node scripts/pkp-task-manager.js set-branch ${taskId} <branch-name>\n`);
    }
    
    log('');
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function listTasksByBranch(branch) {
  try {
    log(`\n🌿 Tasks on branch: ${colors.cyan}${branch}${colors.reset}\n`, 'bright');
    
    const response = await axios.get(`${API_BASE}/npe/pkp/tasks/branch/${encodeURIComponent(branch)}`);
    const tasks = response.data.data;

    if (tasks.length === 0) {
      log('No tasks found on this branch', 'yellow');
      return;
    }

    tasks.forEach((task) => {
      log(`\nTask #${task.id}: ${task.title}`, 'cyan');
      log(`  Status: ${formatStatus(task.status)}`);
      log(`  Agent: ${task.assignedAgent}`);
      if (task.gitContext?.commits) {
        log(`  Commits: ${task.gitContext.commits.length}`);
      }
      if (task.gitContext?.pullRequestUrl) {
        log(`  PR: ${task.gitContext.pullRequestUrl}`, 'green');
      }
    });

    log(`\nTotal: ${tasks.length} tasks on branch ${branch}\n`, 'bright');
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function listTools() {
  try {
    log('\n🛠️  Available PKP Tools\n', 'bright');
    
    const response = await axios.get(`${API_BASE}/npe/pkp/tools`);
    const tools = response.data.data;

    if (tools.length === 0) {
      log('No tools found', 'yellow');
      return;
    }

    const toolsByCategory = {};
    tools.forEach(tool => {
      if (!toolsByCategory[tool.category]) {
        toolsByCategory[tool.category] = [];
      }
      toolsByCategory[tool.category].push(tool);
    });

    Object.keys(toolsByCategory).forEach(category => {
      log(`\n📦 ${category.toUpperCase()}`, 'bright');
      toolsByCategory[category].forEach(tool => {
        log(`  ${colors.cyan}${tool.id}${colors.reset} - ${tool.name}`);
        log(`    ${tool.description}`, 'reset');
        if (tool.requiredPermissions.length > 0) {
          log(`    Permissions: ${tool.requiredPermissions.join(', ')}`, 'yellow');
        }
      });
    });

    log(`\nTotal: ${tools.length} tools available\n`, 'bright');
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

async function executeTool(taskId, toolId, paramsJson) {
  try {
    let params = {};
    if (paramsJson) {
      try {
        params = JSON.parse(paramsJson);
      } catch (e) {
        log(`Error parsing params JSON: ${e.message}`, 'red');
        log('Params should be valid JSON, e.g.: \'{"action":"lint","path":"src"}\'', 'yellow');
        return;
      }
    }

    log(`\n⚙️  Executing tool ${toolId} for Task #${taskId}...\n`, 'bright');
    
    const response = await axios.post(`${API_BASE}/npe/pkp/tasks/${taskId}/execute-tool`, {
      toolId,
      params,
    });

    const result = response.data.data;

    if (result.success) {
      log(`✅ Tool execution successful!\n`, 'green');
      log(`Output: ${result.output}`);
      if (result.executionTime) {
        log(`Execution Time: ${result.executionTime}ms`, 'cyan');
      }
      if (result.metadata) {
        log(`\nMetadata:`, 'bright');
        Object.keys(result.metadata).forEach(key => {
          log(`  ${key}: ${JSON.stringify(result.metadata[key])}`);
        });
      }
    } else {
      log(`❌ Tool execution failed!\n`, 'red');
      log(`Error: ${result.error}`);
    }
    log('');
  } catch (error) {
    log(`\nError: ${error.response?.data?.message || error.message}\n`, 'red');
  }
}

function showHelp() {
  log('\n📚 PKP Task Manager CLI\n', 'bright');
  log('Task Management:');
  log('  list-tasks              List all tasks');
  log('  list-agents             List all agents');
  log('  assign <taskId>         Assign and start a task');
  log('  progress <taskId> <pct> Update task progress');
  log('  complete <taskId>       Mark task as complete');
  log('  dashboard               Show PKP dashboard');
  log('\nGit Context Management:');
  log('  set-branch <taskId> <branch> [baseBranch]  Set Git branch for task');
  log('  record-commit <taskId> <commitHash>        Record a commit');
  log('  set-pr <taskId> <prUrl>                    Set PR URL');
  log('  git-status <taskId>                        Show Git status for task');
  log('  list-by-branch <branch>                    List tasks on a branch');
  log('\nAgent Tools:');
  log('  list-tools                                 List all available tools');
  log('  execute-tool <taskId> <toolId> [params]    Execute a tool');
  log('\nExamples:');
  log('  node scripts/pkp-task-manager.js list-tasks');
  log('  node scripts/pkp-task-manager.js assign 1');
  log('  node scripts/pkp-task-manager.js set-branch 1 feature/pkp-playwright');
  log('  node scripts/pkp-task-manager.js record-commit 1 abc123def');
  log('  node scripts/pkp-task-manager.js git-status 1');
  log('  node scripts/pkp-task-manager.js set-pr 1 https://github.com/user/repo/pull/123');
  log('  node scripts/pkp-task-manager.js list-by-branch feature/pkp-playwright');
  log('  node scripts/pkp-task-manager.js list-tools');
  log('  node scripts/pkp-task-manager.js execute-tool 1 git-operations \'{"action":"commit"}\'');
  log('  node scripts/pkp-task-manager.js execute-tool 1 testing \'{"action":"unit","coverage":true}\'\n');
}

// Main CLI logic
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  switch (command) {
    case 'list-tasks':
      await listTasks();
      break;
    case 'list-agents':
      await listAgents();
      break;
    case 'assign':
      if (!args[1]) {
        log('Error: Task ID required', 'red');
        log('Usage: node scripts/pkp-task-manager.js assign <taskId>');
        return;
      }
      await assignTask(args[1]);
      break;
    case 'progress':
      if (!args[1] || !args[2]) {
        log('Error: Task ID and progress percentage required', 'red');
        log('Usage: node scripts/pkp-task-manager.js progress <taskId> <percentage>');
        return;
      }
      await updateProgress(args[1], args[2]);
      break;
    case 'complete':
      if (!args[1]) {
        log('Error: Task ID required', 'red');
        log('Usage: node scripts/pkp-task-manager.js complete <taskId>');
        return;
      }
      await completeTask(args[1]);
      break;
    case 'dashboard':
      await showDashboard();
      break;
    case 'set-branch':
      if (!args[1] || !args[2]) {
        log('Error: Task ID and branch name required', 'red');
        log('Usage: node scripts/pkp-task-manager.js set-branch <taskId> <branch> [baseBranch]');
        return;
      }
      await setGitBranch(args[1], args[2], args[3]);
      break;
    case 'record-commit':
      if (!args[1] || !args[2]) {
        log('Error: Task ID and commit hash required', 'red');
        log('Usage: node scripts/pkp-task-manager.js record-commit <taskId> <commitHash>');
        return;
      }
      await recordCommit(args[1], args[2]);
      break;
    case 'set-pr':
      if (!args[1] || !args[2]) {
        log('Error: Task ID and PR URL required', 'red');
        log('Usage: node scripts/pkp-task-manager.js set-pr <taskId> <prUrl>');
        return;
      }
      await setPR(args[1], args[2]);
      break;
    case 'git-status':
      if (!args[1]) {
        log('Error: Task ID required', 'red');
        log('Usage: node scripts/pkp-task-manager.js git-status <taskId>');
        return;
      }
      await showTaskGitStatus(args[1]);
      break;
    case 'list-by-branch':
      if (!args[1]) {
        log('Error: Branch name required', 'red');
        log('Usage: node scripts/pkp-task-manager.js list-by-branch <branch>');
        return;
      }
      await listTasksByBranch(args[1]);
      break;
    case 'list-tools':
      await listTools();
      break;
    case 'execute-tool':
      if (!args[1] || !args[2]) {
        log('Error: Task ID and tool ID required', 'red');
        log('Usage: node scripts/pkp-task-manager.js execute-tool <taskId> <toolId> [params]');
        return;
      }
      await executeTool(args[1], args[2], args[3]);
      break;
    default:
      log(`Unknown command: ${command}`, 'red');
      showHelp();
  }
}

main();
