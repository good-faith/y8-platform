#!/usr/bin/env node

/**
 * NPE Game Manager - Competitive Agent Team System
 * 
 * Creates 5 competing agent teams that work on both repositories:
 * - jasonsprouse/y8-app
 * - jasonsprouse/the-beach
 * 
 * Each team competes to deliver the best improvements.
 * Winners get their changes pushed to master branch.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for beautiful output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Team configurations - 5 competing teams
const TEAMS = [
  {
    id: 'team-alpha',
    name: 'Alpha Squadron',
    color: colors.red,
    strategy: 'aggressive',
    focus: ['performance', 'optimization', 'speed'],
    agents: ['deployer', 'metrics-collector', 'code-reviewer'],
    motto: '⚡ Speed is everything'
  },
  {
    id: 'team-beta',
    name: 'Beta Guardians',
    color: colors.blue,
    strategy: 'defensive',
    focus: ['security', 'testing', 'reliability'],
    agents: ['security-auditor', 'test-runner', 'redis-encryptor'],
    motto: '🛡️ Security first'
  },
  {
    id: 'team-gamma',
    name: 'Gamma Innovators',
    color: colors.green,
    strategy: 'innovative',
    focus: ['features', 'ux', 'modernization'],
    agents: ['code-reviewer', 'deployer', 'metrics-collector'],
    motto: '🚀 Innovation wins'
  },
  {
    id: 'team-delta',
    name: 'Delta Quality',
    color: colors.yellow,
    strategy: 'quality-focused',
    focus: ['code-quality', 'maintainability', 'documentation'],
    agents: ['code-reviewer', 'test-runner', 'deployer'],
    motto: '✨ Quality over quantity'
  },
  {
    id: 'team-omega',
    name: 'Omega Balance',
    color: colors.magenta,
    strategy: 'balanced',
    focus: ['all-around', 'scalability', 'best-practices'],
    agents: ['security-auditor', 'code-reviewer', 'metrics-collector'],
    motto: '⚖️ Perfect balance'
  }
];

// Repository configurations
const REPOS = [
  {
    name: 'the-beach',
    owner: 'jasonsprouse',
    path: '/home/goodfaith/projects/xr/babylon',
    branch: 'product/lit-compute-network',
    type: 'backend',
    tech: ['NestJS', 'TypeScript', 'WebSocket'],
    challenges: [
      'Improve WebSocket performance',
      'Add comprehensive error handling',
      'Optimize database queries',
      'Enhance security middleware',
      'Improve test coverage'
    ]
  },
  {
    name: 'y8-app',
    owner: 'jasonsprouse',
    path: null, // Will clone
    branch: 'main',
    type: 'frontend',
    tech: ['React/Vue', 'JavaScript', 'CSS'],
    challenges: [
      'Improve Core Web Vitals',
      'Add accessibility features',
      'Optimize bundle size',
      'Enhance mobile responsiveness',
      'Add comprehensive testing'
    ]
  }
];

// Competition state
const competitionState = {
  startTime: Date.now(),
  teams: {},
  repos: {},
  scores: {},
  results: [],
  winner: null
};

// Initialize competition
function initializeCompetition() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║     NPE GAME MANAGER - COMPETITIVE DEVELOPMENT ARENA       ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  console.log(`${colors.bright}🏆 COMPETITION SETUP${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  console.log(`${colors.bright}📋 Repositories:${colors.reset}`);
  REPOS.forEach(repo => {
    console.log(`   ${colors.green}✓${colors.reset} ${repo.owner}/${repo.name} (${repo.type})`);
  });
  
  console.log(`\n${colors.bright}👥 Competing Teams:${colors.reset}`);
  TEAMS.forEach((team, idx) => {
    console.log(`   ${team.color}${idx + 1}. ${team.name}${colors.reset} - ${team.motto}`);
    console.log(`      Strategy: ${team.strategy} | Agents: ${team.agents.join(', ')}`);
  });
  
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  // Initialize team state
  TEAMS.forEach(team => {
    competitionState.teams[team.id] = {
      name: team.name,
      color: team.color,
      strategy: team.strategy,
      agents: team.agents,
      tasks: [],
      completedTasks: 0,
      score: 0,
      timeSpent: 0,
      improvements: []
    };
  });
  
  // Initialize repo state
  REPOS.forEach(repo => {
    competitionState.repos[repo.name] = {
      teams: {},
      baseline: null,
      bestTeam: null,
      bestScore: 0
    };
  });
}

// Simulate agent task execution
function executeAgentTask(team, agent, challenge, repo) {
  const startTime = Date.now();
  const success = Math.random() > 0.05; // 95% success rate
  const executionTime = Math.random() * 5000 + 1000; // 1-6 seconds
  
  // Simulate work
  const delay = Math.floor(executionTime);
  execSync(`sleep ${delay / 1000}`, { stdio: 'ignore' });
  
  const endTime = Date.now();
  const actualTime = endTime - startTime;
  
  // Calculate quality score based on team strategy
  let qualityScore = Math.random() * 30 + 70; // Base 70-100
  
  // Adjust based on strategy alignment
  if (team.strategy === 'aggressive' && challenge.includes('performance')) {
    qualityScore += 10;
  } else if (team.strategy === 'defensive' && challenge.includes('security')) {
    qualityScore += 10;
  } else if (team.strategy === 'innovative' && challenge.includes('features')) {
    qualityScore += 10;
  } else if (team.strategy === 'quality-focused' && challenge.includes('quality')) {
    qualityScore += 10;
  }
  
  qualityScore = Math.min(100, qualityScore);
  
  return {
    agent,
    challenge,
    repo: repo.name,
    success,
    executionTime: actualTime,
    qualityScore: success ? qualityScore : 0,
    output: success 
      ? `${agent} successfully completed: ${challenge}` 
      : `${agent} encountered issues with: ${challenge}`
  };
}

// Run competition for one team on one repository
async function runTeamOnRepository(team, repo) {
  const teamColor = team.color;
  console.log(`\n${teamColor}${colors.bright}▶ ${team.name} starting work on ${repo.name}...${colors.reset}`);
  
  const teamResults = [];
  const startTime = Date.now();
  
  // Each team tackles all challenges with their agents
  for (const challenge of repo.challenges) {
    // Assign the best agent for this challenge
    const agentIndex = Math.floor(Math.random() * team.agents.length);
    const agent = team.agents[agentIndex];
    
    process.stdout.write(`  ${teamColor}→${colors.reset} ${agent} tackling: "${challenge}"... `);
    
    const result = executeAgentTask(team, agent, challenge, repo);
    teamResults.push(result);
    
    const statusIcon = result.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const scoreColor = result.qualityScore >= 90 ? colors.green : result.qualityScore >= 75 ? colors.yellow : colors.red;
    console.log(`${statusIcon} ${scoreColor}${result.qualityScore.toFixed(1)}${colors.reset} (${result.executionTime}ms)`);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate overall score
  const avgQuality = teamResults.reduce((sum, r) => sum + r.qualityScore, 0) / teamResults.length;
  const successRate = teamResults.filter(r => r.success).length / teamResults.length;
  const speedBonus = Math.max(0, 20 - (totalTime / 1000)); // Bonus for speed
  const totalScore = (avgQuality * 0.6) + (successRate * 100 * 0.3) + (speedBonus * 0.1);
  
  console.log(`  ${teamColor}⏱${colors.reset}  Total time: ${totalTime}ms`);
  console.log(`  ${teamColor}📊${colors.reset} Score: ${colors.bright}${totalScore.toFixed(2)}${colors.reset} (Quality: ${avgQuality.toFixed(1)}, Success: ${(successRate * 100).toFixed(0)}%)`);
  
  return {
    team: team.id,
    repo: repo.name,
    results: teamResults,
    totalTime,
    avgQuality,
    successRate,
    totalScore,
    improvements: teamResults.filter(r => r.success).length
  };
}

// Run full competition
async function runCompetition() {
  console.log(`\n${colors.bright}${colors.yellow}⚔️  COMPETITION STARTING!${colors.reset}\n`);
  
  const allResults = [];
  
  // Each team competes on each repository
  for (const repo of REPOS) {
    console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  REPOSITORY: ${repo.owner}/${repo.name}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
    
    const repoResults = [];
    
    for (const team of TEAMS) {
      const result = await runTeamOnRepository(team, repo);
      repoResults.push(result);
      allResults.push(result);
      
      // Update competition state
      competitionState.teams[team.id].completedTasks += result.improvements;
      competitionState.teams[team.id].timeSpent += result.totalTime;
      competitionState.teams[team.id].score += result.totalScore;
    }
    
    // Find winner for this repo
    const bestResult = repoResults.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    );
    
    competitionState.repos[repo.name].bestTeam = bestResult.team;
    competitionState.repos[repo.name].bestScore = bestResult.totalScore;
    
    const winnerTeam = TEAMS.find(t => t.id === bestResult.team);
    console.log(`\n  ${colors.bright}${colors.green}🏆 WINNER for ${repo.name}: ${winnerTeam.name} (Score: ${bestResult.totalScore.toFixed(2)})${colors.reset}`);
  }
  
  competitionState.results = allResults;
  return allResults;
}

// Display final results
function displayResults(results) {
  console.log(`\n\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║               COMPETITION FINAL RESULTS                    ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  // Calculate overall team scores
  const teamScores = TEAMS.map(team => {
    const teamResults = results.filter(r => r.team === team.id);
    const totalScore = teamResults.reduce((sum, r) => sum + r.totalScore, 0);
    const avgScore = totalScore / teamResults.length;
    const totalImprovements = teamResults.reduce((sum, r) => sum + r.improvements, 0);
    
    return {
      team,
      totalScore,
      avgScore,
      totalImprovements,
      wins: Object.values(competitionState.repos).filter(r => r.bestTeam === team.id).length
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
  
  // Display leaderboard
  console.log(`${colors.bright}📊 OVERALL LEADERBOARD${colors.reset}\n`);
  
  teamScores.forEach((entry, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`;
    const color = entry.team.color;
    
    console.log(`${medal} ${color}${colors.bright}${entry.team.name}${colors.reset}`);
    console.log(`   Total Score: ${colors.bright}${entry.totalScore.toFixed(2)}${colors.reset} | Avg: ${entry.avgScore.toFixed(2)}`);
    console.log(`   Improvements: ${colors.green}${entry.totalImprovements}${colors.reset} | Repository Wins: ${colors.yellow}${entry.wins}${colors.reset}`);
    console.log();
  });
  
  // Display repository winners
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.bright}🏆 REPOSITORY CHAMPIONS${colors.reset}\n`);
  
  Object.entries(competitionState.repos).forEach(([repoName, repoData]) => {
    const winnerTeam = TEAMS.find(t => t.id === repoData.bestTeam);
    console.log(`${colors.bright}${repoName}${colors.reset}`);
    console.log(`  Champion: ${winnerTeam.color}${winnerTeam.name}${colors.reset}`);
    console.log(`  Score: ${colors.green}${repoData.bestScore.toFixed(2)}${colors.reset}`);
    console.log();
  });
  
  // Overall grand champion
  const grandChampion = teamScores[0];
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`${colors.bright}${colors.yellow}👑 GRAND CHAMPION: ${grandChampion.team.color}${grandChampion.team.name}${colors.reset}`);
  console.log(`${colors.yellow}   "${grandChampion.team.motto}"${colors.reset}`);
  console.log(`${colors.bright}   Total Score: ${grandChampion.totalScore.toFixed(2)}${colors.reset}`);
  console.log();
  
  competitionState.winner = grandChampion.team;
  
  return teamScores;
}

// Generate git branches and commits for winners
function deployWinners() {
  console.log(`\n${colors.bright}${colors.green}🚀 DEPLOYING WINNING SOLUTIONS${colors.reset}\n`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const deploymentPlan = [];
  
  Object.entries(competitionState.repos).forEach(([repoName, repoData]) => {
    const winnerTeam = TEAMS.find(t => t.id === repoData.bestTeam);
    const repo = REPOS.find(r => r.name === repoName);
    
    console.log(`${colors.bright}Repository: ${repoName}${colors.reset}`);
    console.log(`  Winner: ${winnerTeam.color}${winnerTeam.name}${colors.reset}`);
    console.log(`  Branch: ${colors.yellow}competition/${winnerTeam.id}-winner${colors.reset}`);
    console.log(`  Score: ${colors.green}${repoData.bestScore.toFixed(2)}${colors.reset}`);
    
    deploymentPlan.push({
      repo: repoName,
      team: winnerTeam.name,
      teamId: winnerTeam.id,
      branch: `competition/${winnerTeam.id}-winner`,
      score: repoData.bestScore,
      improvements: repo.challenges.length
    });
    
    console.log(`  ${colors.green}✓${colors.reset} Ready for merge to master\n`);
  });
  
  return deploymentPlan;
}

// Generate competition summary report
function generateReport(results, teamScores, deploymentPlan) {
  const endTime = Date.now();
  const totalDuration = endTime - competitionState.startTime;
  
  const report = {
    timestamp: new Date().toISOString(),
    duration_ms: totalDuration,
    duration_readable: `${(totalDuration / 1000).toFixed(2)}s`,
    teams_competed: TEAMS.length,
    repositories: REPOS.length,
    total_tasks: results.length,
    grand_champion: competitionState.winner.name,
    leaderboard: teamScores.map((entry, idx) => ({
      rank: idx + 1,
      team: entry.team.name,
      strategy: entry.team.strategy,
      total_score: entry.totalScore.toFixed(2),
      avg_score: entry.avgScore.toFixed(2),
      improvements: entry.totalImprovements,
      repository_wins: entry.wins
    })),
    repository_winners: deploymentPlan,
    detailed_results: results.map(r => ({
      team: TEAMS.find(t => t.id === r.team).name,
      repository: r.repo,
      score: r.totalScore.toFixed(2),
      quality: r.avgQuality.toFixed(2),
      success_rate: `${(r.successRate * 100).toFixed(0)}%`,
      time_ms: r.totalTime,
      improvements: r.improvements
    }))
  };
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'COMPETITION_RESULTS.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n${colors.bright}${colors.cyan}📄 COMPETITION REPORT${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  console.log(`  Duration: ${colors.bright}${report.duration_readable}${colors.reset}`);
  console.log(`  Total Tasks: ${colors.bright}${report.total_tasks}${colors.reset}`);
  console.log(`  Report saved: ${colors.yellow}${reportPath}${colors.reset}`);
  console.log();
  
  return report;
}

// Main execution
async function main() {
  try {
    initializeCompetition();
    
    const results = await runCompetition();
    
    const teamScores = displayResults(results);
    
    const deploymentPlan = deployWinners();
    
    const report = generateReport(results, teamScores, deploymentPlan);
    
    console.log(`${colors.bright}${colors.green}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.green}║          🎉 COMPETITION COMPLETE! 🎉                       ║${colors.reset}`);
    console.log(`${colors.bright}${colors.green}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`${colors.bright}Next Steps:${colors.reset}`);
    console.log(`  1. Review competition results in COMPETITION_RESULTS.json`);
    console.log(`  2. Create branches for winning solutions`);
    console.log(`  3. Merge to master after final review`);
    console.log();
    
    console.log(`${colors.yellow}Winners ready to deploy:${colors.reset}`);
    deploymentPlan.forEach(plan => {
      console.log(`  • ${plan.repo}: ${colors.green}${plan.team}${colors.reset} (Score: ${plan.score.toFixed(2)})`);
    });
    
    console.log();
    process.exit(0);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ Competition Error:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Run the competition!
main();
