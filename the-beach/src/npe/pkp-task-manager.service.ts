import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PKPToolRegistry, ToolExecutionResult } from './agents/pkp-agent-tools';

/**
 * PKP Task Status
 */
export enum PKPTaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * PKP Task Priority
 */
export enum PKPTaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * PKP Agent Type
 */
export enum PKPAgentType {
  REDIS_ENCRYPTOR = 'pkp_redis_encryptor',
  TEST_RUNNER = 'pkp_test_runner',
  CODE_REVIEWER = 'pkp_code_reviewer',
  METRICS_COLLECTOR = 'pkp_metrics_collector',
  SECURITY_AUDITOR = 'pkp_security_auditor',
  DEPLOYER = 'pkp_deployer',
}

/**
 * Git Context for PKP Task
 */
export interface PKPGitContext {
  branch: string;              // Target branch to work on
  baseBranch?: string;         // Base branch to branch from (default: master/main)
  startCommit?: string;        // Commit hash where work started
  currentCommit?: string;      // Current commit hash
  targetCommit?: string;       // Target commit to reach
  commits?: string[];          // List of commits made by PKP
  pullRequestUrl?: string;     // PR URL when work is ready for review
}

/**
 * PKP Task Interface
 */
export interface PKPTask {
  id: number;
  title: string;
  description: string;
  repository: string;
  priority: PKPTaskPriority;
  status: PKPTaskStatus;
  assignedAgent: PKPAgentType;
  estimatedHours: number;
  actualHours?: number;
  startedAt?: Date;
  completedAt?: Date;
  acceptanceCriteria: string[];
  filesToCreate: string[];
  blockers: string[];
  progressPercent: number;
  gitContext?: PKPGitContext;  // Git branch and commit tracking
}

/**
 * PKP Agent Interface
 */
export interface PKPAgent {
  type: PKPAgentType;
  name: string;
  wallet?: string;
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  currentTask?: number;
  tasksCompleted: number;
  totalHours: number;
  successRate: number;
  lastActive?: Date;
}

/**
 * PKP Task Manager Service
 * 
 * Manages work assignments for PKP (Programmable Key Pair) agents
 * across The Beach and Y8 App repositories.
 */
@Injectable()
export class PKPTaskManagerService {
  private readonly logger = new Logger(PKPTaskManagerService.name);
  private tasks: Map<number, PKPTask> = new Map();
  private agents: Map<PKPAgentType, PKPAgent> = new Map();
  private toolRegistry: PKPToolRegistry;

  constructor() {
    this.toolRegistry = new PKPToolRegistry();
    this.initializeAgents();
    this.initializeTasks();
  }

  /**
   * Initialize PKP agents
   */
  private initializeAgents(): void {
    const agents: PKPAgent[] = [
      {
        type: PKPAgentType.REDIS_ENCRYPTOR,
        name: 'PKP Redis Encryptor',
        status: 'active',
        capabilities: [
          'Encrypt/decrypt Redis configurations',
          'Generate environment variables',
          'Manage secrets',
          'Access control enforcement',
        ],
        tasksCompleted: 1,
        totalHours: 8,
        successRate: 100,
        lastActive: new Date(),
      },
      {
        type: PKPAgentType.TEST_RUNNER,
        name: 'PKP Test Runner',
        status: 'inactive',
        capabilities: [
          'Run E2E tests',
          'Submit test jobs',
          'Monitor results',
          'Generate reports',
        ],
        tasksCompleted: 0,
        totalHours: 0,
        successRate: 0,
      },
      {
        type: PKPAgentType.CODE_REVIEWER,
        name: 'PKP Code Reviewer',
        status: 'inactive',
        capabilities: [
          'Review PRs',
          'Check code quality',
          'Verify coverage',
          'Auto-approve changes',
        ],
        tasksCompleted: 0,
        totalHours: 0,
        successRate: 0,
      },
      {
        type: PKPAgentType.METRICS_COLLECTOR,
        name: 'PKP Metrics Collector',
        status: 'inactive',
        capabilities: [
          'Collect metrics',
          'Monitor performance',
          'Track statistics',
          'Generate reports',
        ],
        tasksCompleted: 0,
        totalHours: 0,
        successRate: 0,
      },
      {
        type: PKPAgentType.SECURITY_AUDITOR,
        name: 'PKP Security Auditor',
        status: 'inactive',
        capabilities: [
          'Scan vulnerabilities',
          'Check dependencies',
          'Audit contracts',
          'Generate security reports',
        ],
        tasksCompleted: 0,
        totalHours: 0,
        successRate: 0,
      },
      {
        type: PKPAgentType.DEPLOYER,
        name: 'PKP Deployer',
        status: 'inactive',
        capabilities: [
          'Deploy to environments',
          'Run migrations',
          'Health checks',
          'Rollback on failure',
        ],
        tasksCompleted: 0,
        totalHours: 0,
        successRate: 0,
      },
    ];

    agents.forEach((agent) => {
      this.agents.set(agent.type, agent);
    });

    this.logger.log(`Initialized ${agents.length} PKP agents`);
  }

  /**
   * Initialize tasks from PKP_WORK_ASSIGNMENT.md
   */
  private initializeTasks(): void {
    const tasks: PKPTask[] = [
      {
        id: 1,
        title: 'Y8 App Playwright Setup',
        description: 'Set up Playwright testing framework for Y8 App',
        repository: 'jasonsprouse/y8-app',
        priority: PKPTaskPriority.HIGH,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.TEST_RUNNER,
        estimatedHours: 4,
        acceptanceCriteria: [
          'Playwright installed and configured',
          'Test structure created at tests/e2e/',
          'All 5 tests passing',
          'Tests run in CI/CD pipeline',
          'Documentation in tests/README.md',
        ],
        filesToCreate: [
          'tests/e2e/lit-compute/job-submission.spec.ts',
          'tests/e2e/lit-compute/node-dashboard.spec.ts',
          'tests/e2e/lit-compute/payment.spec.ts',
          'tests/e2e/lit-compute/websocket.spec.ts',
          'tests/e2e/lit-compute/error-handling.spec.ts',
          'tests/README.md',
          'playwright.config.ts',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-playwright-tests',
          baseBranch: 'master',
        },
      },
      {
        id: 2,
        title: 'Continuous Job Submission Testing',
        description: 'Create service that continuously submits test jobs',
        repository: 'jasonsprouse/the-beach',
        priority: PKPTaskPriority.MEDIUM,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.TEST_RUNNER,
        estimatedHours: 6,
        acceptanceCriteria: [
          'Service runs every 5 minutes',
          'Successfully submits jobs',
          'Tracks completion time',
          'Logs to database',
          'Alerts on failures via WebSocket',
          'Dashboard shows job history',
        ],
        filesToCreate: [
          'src/npe/agents/pkp-job-submitter.service.ts',
          'src/npe/agents/test-data-generator.ts',
          'src/npe/agents/job-metrics.entity.ts',
          'src/npe/agents/pkp-job-submitter.spec.ts',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-continuous-testing',
          baseBranch: 'product/lit-compute-network',
        },
      },
      {
        id: 3,
        title: 'GitHub PR Review Automation',
        description: 'Automated PR review system using GitHub API',
        repository: 'both',
        priority: PKPTaskPriority.MEDIUM,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.CODE_REVIEWER,
        estimatedHours: 8,
        acceptanceCriteria: [
          'Webhook receives PR events',
          'Runs all quality checks',
          'Posts review comments',
          'Auto-approves safe changes',
          'Flags security issues',
          'Tracks review metrics',
        ],
        filesToCreate: [
          'src/npe/agents/pkp-code-reviewer.service.ts',
          'src/npe/agents/github-webhook.controller.ts',
          'src/npe/agents/code-analysis.service.ts',
          'src/npe/agents/security-scanner.service.ts',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-pr-automation',
          baseBranch: 'product/lit-compute-network',
        },
      },
      {
        id: 4,
        title: 'Lit Compute Network Metrics Dashboard',
        description: 'Real-time metrics collection and visualization',
        repository: 'jasonsprouse/y8-app',
        priority: PKPTaskPriority.LOW,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.METRICS_COLLECTOR,
        estimatedHours: 10,
        acceptanceCriteria: [
          'Metrics collected every minute',
          'Dashboard shows real-time data',
          'Charts for jobs, payments, nodes',
          'Historical data stored',
          'Export functionality works',
          'Mobile-responsive UI',
        ],
        filesToCreate: [
          'app/metrics/page.tsx',
          'app/metrics/components/MetricsChart.tsx',
          'app/metrics/components/NodeHealthCard.tsx',
          'app/api/metrics/route.ts',
          'src/npe/agents/metrics-collector.service.ts',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-metrics-dashboard',
          baseBranch: 'master',
        },
      },
      {
        id: 5,
        title: 'Automated Security Scanning',
        description: 'Comprehensive security scanning for both repositories',
        repository: 'both',
        priority: PKPTaskPriority.HIGH,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.SECURITY_AUDITOR,
        estimatedHours: 12,
        acceptanceCriteria: [
          'Daily security scans running',
          'All tools integrated',
          'Reports generated',
          'Critical issues flagged',
          'Notifications sent',
          'Historical tracking',
        ],
        filesToCreate: [
          'src/npe/agents/security-auditor.service.ts',
          'src/npe/agents/dependency-scanner.ts',
          'src/npe/agents/contract-auditor.ts',
          'src/npe/agents/secrets-detector.ts',
          '.github/workflows/security-scan.yml',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-security-scanning',
          baseBranch: 'product/lit-compute-network',
        },
      },
      {
        id: 6,
        title: 'Automated Deployment Pipeline',
        description: 'Automated deployment with environment promotion',
        repository: 'both',
        priority: PKPTaskPriority.MEDIUM,
        status: PKPTaskStatus.NOT_STARTED,
        assignedAgent: PKPAgentType.DEPLOYER,
        estimatedHours: 10,
        acceptanceCriteria: [
          'Workflows deploy to all envs',
          'Migrations run successfully',
          'Health checks pass',
          'Rollback tested',
          'Notifications working',
          'Audit log complete',
        ],
        filesToCreate: [
          '.github/workflows/deploy-staging.yml',
          '.github/workflows/deploy-production.yml',
          'scripts/deploy.sh',
          'scripts/migrate.sh',
          'scripts/health-check.sh',
          'src/npe/agents/pkp-deployer.service.ts',
        ],
        blockers: [],
        progressPercent: 0,
        gitContext: {
          branch: 'feature/pkp-deployment-pipeline',
          baseBranch: 'product/lit-compute-network',
        },
      },
    ];

    tasks.forEach((task) => {
      this.tasks.set(task.id, task);
    });

    this.logger.log(`Initialized ${tasks.length} PKP tasks`);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): PKPTask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get task by ID
   */
  getTask(id: number): PKPTask | undefined {
    return this.tasks.get(id);
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: PKPTaskStatus): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === status,
    );
  }

  /**
   * Get tasks by priority
   */
  getTasksByPriority(priority: PKPTaskPriority): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.priority === priority,
    );
  }

  /**
   * Get tasks by agent
   */
  getTasksByAgent(agent: PKPAgentType): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assignedAgent === agent,
    );
  }

  /**
   * Start a task
   */
  startTask(taskId: number): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (task.status !== PKPTaskStatus.NOT_STARTED) {
      throw new Error(`Task ${taskId} already started`);
    }

    task.status = PKPTaskStatus.IN_PROGRESS;
    task.startedAt = new Date();

    // Update agent
    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.status = 'active';
      agent.currentTask = taskId;
      agent.lastActive = new Date();
    }

    this.logger.log(
      `Task ${taskId} started by ${task.assignedAgent} at ${task.startedAt}`,
    );

    return task;
  }

  /**
   * Update task progress
   */
  updateTaskProgress(taskId: number, progressPercent: number): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.progressPercent = Math.min(100, Math.max(0, progressPercent));

    // Update agent last active
    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.lastActive = new Date();
    }

    this.logger.log(`Task ${taskId} progress: ${task.progressPercent}%`);

    return task;
  }

  /**
   * Complete a task
   */
  completeTask(taskId: number): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = PKPTaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.progressPercent = 100;

    if (task.startedAt) {
      const hours =
        (task.completedAt.getTime() - task.startedAt.getTime()) /
        (1000 * 60 * 60);
      task.actualHours = Math.round(hours * 10) / 10;
    }

    // Update agent
    const agent = this.agents.get(task.assignedAgent);
    if (agent) {
      agent.currentTask = undefined;
      agent.tasksCompleted += 1;
      agent.totalHours += task.actualHours || task.estimatedHours;
      agent.lastActive = new Date();

      // Recalculate success rate
      const allAgentTasks = this.getTasksByAgent(task.assignedAgent);
      const completedTasks = allAgentTasks.filter(
        (t) => t.status === PKPTaskStatus.COMPLETED,
      );
      agent.successRate = Math.round(
        (completedTasks.length / allAgentTasks.length) * 100,
      );
    }

    this.logger.log(
      `Task ${taskId} completed by ${task.assignedAgent} in ${task.actualHours || 'unknown'} hours`,
    );

    return task;
  }

  /**
   * Add blocker to task
   */
  addBlocker(taskId: number, blocker: string): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.blockers.push(blocker);
    task.status = PKPTaskStatus.BLOCKED;

    this.logger.warn(`Task ${taskId} blocked: ${blocker}`);

    return task;
  }

  /**
   * Remove blocker from task
   */
  removeBlocker(taskId: number, blocker: string): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.blockers = task.blockers.filter((b) => b !== blocker);

    if (task.blockers.length === 0) {
      task.status = PKPTaskStatus.IN_PROGRESS;
    }

    this.logger.log(`Task ${taskId} blocker removed: ${blocker}`);

    return task;
  }

  /**
   * Get all agents
   */
  getAllAgents(): PKPAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by type
   */
  getAgent(type: PKPAgentType): PKPAgent | undefined {
    return this.agents.get(type);
  }

  /**
   * Get dashboard summary
   */
  getDashboard() {
    const tasks = this.getAllTasks();
    const agents = this.getAllAgents();

    return {
      summary: {
        totalTasks: tasks.length,
        notStarted: tasks.filter((t) => t.status === PKPTaskStatus.NOT_STARTED)
          .length,
        inProgress: tasks.filter((t) => t.status === PKPTaskStatus.IN_PROGRESS)
          .length,
        blocked: tasks.filter((t) => t.status === PKPTaskStatus.BLOCKED).length,
        completed: tasks.filter((t) => t.status === PKPTaskStatus.COMPLETED)
          .length,
        failed: tasks.filter((t) => t.status === PKPTaskStatus.FAILED).length,
        totalEstimatedHours: tasks.reduce(
          (sum, t) => sum + t.estimatedHours,
          0,
        ),
        totalActualHours: tasks.reduce(
          (sum, t) => sum + (t.actualHours || 0),
          0,
        ),
      },
      byPriority: {
        high: tasks.filter((t) => t.priority === PKPTaskPriority.HIGH).length,
        medium: tasks.filter((t) => t.priority === PKPTaskPriority.MEDIUM)
          .length,
        low: tasks.filter((t) => t.priority === PKPTaskPriority.LOW).length,
      },
      byRepository: {
        theBeach: tasks.filter((t) => t.repository === 'jasonsprouse/the-beach')
          .length,
        y8App: tasks.filter((t) => t.repository === 'jasonsprouse/y8-app')
          .length,
        both: tasks.filter((t) => t.repository === 'both').length,
      },
      agents: agents.map((agent) => ({
        type: agent.type,
        name: agent.name,
        status: agent.status,
        tasksCompleted: agent.tasksCompleted,
        totalHours: agent.totalHours,
        successRate: agent.successRate,
        currentTask: agent.currentTask,
      })),
      upcomingTasks: tasks
        .filter((t) => t.status === PKPTaskStatus.NOT_STARTED)
        .sort((a, b) => {
          // Sort by priority (high > medium > low)
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 5),
    };
  }

  /**
   * Update Git context for a task
   */
  updateGitContext(
    taskId: number,
    gitContext: Partial<PKPGitContext>,
  ): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.gitContext = {
      ...task.gitContext,
      ...gitContext,
    } as PKPGitContext;

    this.logger.log(
      `Updated Git context for task ${taskId}: branch=${task.gitContext.branch}, commit=${task.gitContext.currentCommit}`,
    );

    return task;
  }

  /**
   * Record a commit for a task
   */
  recordCommit(taskId: number, commitHash: string): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (!task.gitContext) {
      throw new Error(`Task ${taskId} has no Git context`);
    }

    // Initialize commits array if needed
    if (!task.gitContext.commits) {
      task.gitContext.commits = [];
    }

    task.gitContext.commits.push(commitHash);
    task.gitContext.currentCommit = commitHash;

    // Set start commit if this is the first commit
    if (!task.gitContext.startCommit) {
      task.gitContext.startCommit = commitHash;
    }

    this.logger.log(
      `Recorded commit ${commitHash} for task ${taskId} (total: ${task.gitContext.commits.length} commits)`,
    );

    return task;
  }

  /**
   * Set PR URL for a task
   */
  setPullRequestUrl(taskId: number, prUrl: string): PKPTask {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (!task.gitContext) {
      throw new Error(`Task ${taskId} has no Git context`);
    }

    task.gitContext.pullRequestUrl = prUrl;

    this.logger.log(`Set PR URL for task ${taskId}: ${prUrl}`);

    return task;
  }

  /**
   * Get tasks by branch
   */
  getTasksByBranch(branch: string): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.gitContext?.branch === branch,
    );
  }

  /**
   * Get tasks with Git context
   */
  getTasksWithGitContext(): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.gitContext !== undefined,
    );
  }

  /**
   * Get all available tools
   */
  getAvailableTools() {
    return this.toolRegistry.getAll().map((tool) => ({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      description: tool.description,
      requiredPermissions: tool.requiredPermissions,
    }));
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string) {
    return this.toolRegistry.getByCategory(category as any);
  }

  /**
   * Execute a tool for a task
   */
  async executeTool(
    taskId: number,
    toolId: string,
    params: any,
  ): Promise<ToolExecutionResult> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    this.logger.log(
      `Executing tool ${toolId} for task ${taskId} by ${task.assignedAgent}`,
    );

    const result = await this.toolRegistry.executeTool(toolId, params);

    // Log the result
    if (result.success) {
      this.logger.log(
        `Tool ${toolId} completed successfully in ${result.executionTime}ms`,
      );
    } else {
      this.logger.error(`Tool ${toolId} failed: ${result.error}`);
    }

    return result;
  }

  /**
   * Get active tasks for a main PKP
   */
  getActiveTasksForPKP(mainPKP: string): PKPTask[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === PKPTaskStatus.IN_PROGRESS,
    );
  }

  /**
   * Get active tasks for a sub-PKP
   */
  getActiveTasksForSubPKP(subPKP: string): PKPTask[] {
    // In a real implementation, we'd track which sub-PKP is handling which task
    // For now, return tasks based on agent type assignment
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === PKPTaskStatus.IN_PROGRESS,
    );
  }

  /**
   * Assign task to a specific agent
   */
  assignTaskToAgent(taskId: number, agentType: PKPAgentType): void {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent ${agentType} not found`);
    }

    task.assignedAgent = agentType;
    task.status = PKPTaskStatus.NOT_STARTED; // Mark as ready to start
    agent.currentTask = taskId;

    this.logger.log(
      `Task ${taskId} assigned to agent ${agentType} by task authorization system`,
    );
  }

  /**
   * Cron job to check for blocked tasks
   */
  @Cron(CronExpression.EVERY_HOUR)
  checkBlockedTasks() {
    const blockedTasks = this.getTasksByStatus(PKPTaskStatus.BLOCKED);

    if (blockedTasks.length > 0) {
      this.logger.warn(
        `Found ${blockedTasks.length} blocked tasks: ${blockedTasks.map((t) => t.id).join(', ')}`,
      );

      // TODO: Send alerts via WebSocket or Slack
    }
  }

  /**
   * Cron job to check for stale in-progress tasks
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  checkStaleTask() {
    const inProgressTasks = this.getTasksByStatus(PKPTaskStatus.IN_PROGRESS);
    const now = new Date();
    const staleThreshold = 24 * 60 * 60 * 1000; // 24 hours

    inProgressTasks.forEach((task) => {
      if (task.startedAt) {
        const elapsed = now.getTime() - task.startedAt.getTime();
        const estimatedMs = task.estimatedHours * 60 * 60 * 1000;

        if (elapsed > estimatedMs * 1.5 && elapsed > staleThreshold) {
          this.logger.warn(
            `Task ${task.id} is stale (running ${Math.round(elapsed / (60 * 60 * 1000))}h vs estimated ${task.estimatedHours}h)`,
          );

          // TODO: Send alerts
        }
      }
    });
  }
}
