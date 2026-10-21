import { Controller, Get, Post, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PKPTaskManagerService, PKPTaskStatus, PKPTaskPriority, PKPAgentType } from './pkp-task-manager.service';

/**
 * PKP Controller
 * 
 * REST API endpoints for managing PKP (Programmable Key Pair) agents and tasks
 */
@Controller('npe/pkp')
export class PKPController {
  constructor(private readonly pkpTaskManager: PKPTaskManagerService) {}

  /**
   * Get all PKP tasks
   * GET /npe/pkp/tasks
   */
  @Get('tasks')
  getAllTasks() {
    return {
      success: true,
      data: this.pkpTaskManager.getAllTasks(),
      count: this.pkpTaskManager.getAllTasks().length,
    };
  }

  /**
   * Get task by ID
   * GET /npe/pkp/tasks/:id
   */
  @Get('tasks/:id')
  getTask(@Param('id') id: string) {
    const taskId = parseInt(id, 10);
    const task = this.pkpTaskManager.getTask(taskId);

    if (!task) {
      throw new HttpException(
        `Task ${taskId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      data: task,
    };
  }

  /**
   * Get tasks by status
   * GET /npe/pkp/tasks/status/:status
   */
  @Get('tasks/status/:status')
  getTasksByStatus(@Param('status') status: string) {
    const taskStatus = status.toUpperCase() as PKPTaskStatus;
    const tasks = this.pkpTaskManager.getTasksByStatus(taskStatus);

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * Get tasks by priority
   * GET /npe/pkp/tasks/priority/:priority
   */
  @Get('tasks/priority/:priority')
  getTasksByPriority(@Param('priority') priority: string) {
    const taskPriority = priority.toLowerCase() as PKPTaskPriority;
    const tasks = this.pkpTaskManager.getTasksByPriority(taskPriority);

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * Get tasks by agent
   * GET /npe/pkp/tasks/agent/:agentType
   */
  @Get('tasks/agent/:agentType')
  getTasksByAgent(@Param('agentType') agentType: string) {
    const agent = agentType as PKPAgentType;
    const tasks = this.pkpTaskManager.getTasksByAgent(agent);

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * Start a task
   * POST /npe/pkp/tasks/:id/start
   */
  @Post('tasks/:id/start')
  startTask(@Param('id') id: string) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.startTask(taskId);

      return {
        success: true,
        message: `Task ${taskId} started`,
        data: task,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update task progress
   * POST /npe/pkp/tasks/:id/progress
   */
  @Post('tasks/:id/progress')
  updateTaskProgress(
    @Param('id') id: string,
    @Body() body: { progressPercent: number },
  ) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.updateTaskProgress(
        taskId,
        body.progressPercent,
      );

      return {
        success: true,
        message: `Task ${taskId} progress updated to ${body.progressPercent}%`,
        data: task,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Complete a task
   * POST /npe/pkp/tasks/:id/complete
   */
  @Post('tasks/:id/complete')
  completeTask(@Param('id') id: string) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.completeTask(taskId);

      return {
        success: true,
        message: `Task ${taskId} completed`,
        data: task,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Add blocker to task
   * POST /npe/pkp/tasks/:id/blockers
   */
  @Post('tasks/:id/blockers')
  addBlocker(@Param('id') id: string, @Body() body: { blocker: string }) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.addBlocker(taskId, body.blocker);

      return {
        success: true,
        message: `Blocker added to task ${taskId}`,
        data: task,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all PKP agents
   * GET /npe/pkp/agents
   */
  @Get('agents')
  getAllAgents() {
    return {
      success: true,
      data: this.pkpTaskManager.getAllAgents(),
      count: this.pkpTaskManager.getAllAgents().length,
    };
  }

  /**
   * Get agent by type
   * GET /npe/pkp/agents/:type
   */
  @Get('agents/:type')
  getAgent(@Param('type') type: string) {
    const agentType = type as PKPAgentType;
    const agent = this.pkpTaskManager.getAgent(agentType);

    if (!agent) {
      throw new HttpException(
        `Agent ${agentType} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      data: agent,
    };
  }

  /**
   * Get PKP dashboard
   * GET /npe/pkp/dashboard
   */
  @Get('dashboard')
  getDashboard() {
    return {
      success: true,
      data: this.pkpTaskManager.getDashboard(),
    };
  }

  /**
   * Update Git context for a task
   * POST /npe/pkp/tasks/:id/git-context
   */
  @Post('tasks/:id/git-context')
  updateGitContext(
    @Param('id') id: string,
    @Body() gitContext: any,
  ) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.updateGitContext(taskId, gitContext);

      return {
        success: true,
        message: 'Git context updated',
        data: task,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Record a commit for a task
   * POST /npe/pkp/tasks/:id/commit
   */
  @Post('tasks/:id/commit')
  recordCommit(
    @Param('id') id: string,
    @Body() body: { commitHash: string },
  ) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.recordCommit(taskId, body.commitHash);

      return {
        success: true,
        message: 'Commit recorded',
        data: task,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Set PR URL for a task
   * POST /npe/pkp/tasks/:id/pr
   */
  @Post('tasks/:id/pr')
  setPullRequestUrl(
    @Param('id') id: string,
    @Body() body: { prUrl: string },
  ) {
    try {
      const taskId = parseInt(id, 10);
      const task = this.pkpTaskManager.setPullRequestUrl(taskId, body.prUrl);

      return {
        success: true,
        message: 'PR URL set',
        data: task,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get tasks by branch
   * GET /npe/pkp/tasks/branch/:branch
   */
  @Get('tasks/branch/:branch')
  getTasksByBranch(@Param('branch') branch: string) {
    const tasks = this.pkpTaskManager.getTasksByBranch(branch);

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * Get tasks with Git context
   * GET /npe/pkp/tasks/with-git-context
   */
  @Get('tasks/with-git-context')
  getTasksWithGitContext() {
    const tasks = this.pkpTaskManager.getTasksWithGitContext();

    return {
      success: true,
      data: tasks,
      count: tasks.length,
    };
  }

  /**
   * Get all available tools
   * GET /npe/pkp/tools
   */
  @Get('tools')
  getAvailableTools() {
    const tools = this.pkpTaskManager.getAvailableTools();

    return {
      success: true,
      data: tools,
      count: tools.length,
    };
  }

  /**
   * Get tools by category
   * GET /npe/pkp/tools/category/:category
   */
  @Get('tools/category/:category')
  getToolsByCategory(@Param('category') category: string) {
    const tools = this.pkpTaskManager.getToolsByCategory(category);

    return {
      success: true,
      data: tools,
      count: tools.length,
    };
  }

  /**
   * Execute a tool for a task
   * POST /npe/pkp/tasks/:id/execute-tool
   */
  @Post('tasks/:id/execute-tool')
  async executeTool(
    @Param('id') id: number,
    @Body() body: { toolId: string; params: any },
  ) {
    const result = await this.pkpTaskManager.executeTool(
      id,
      body.toolId,
      body.params,
    );
    return {
      success: true,
      message: 'Tool executed successfully',
      data: result,
    };
  }

  // ============================================================================
  // VR Workspace Endpoints
  // ============================================================================

  @Get('vr/workspaces')
  async getVRWorkspaces() {
    const { vrWorkspaceManager } = require('./agents/pkp-vr-tools');
    const workspaces = vrWorkspaceManager.listWorkspaces();
    return {
      success: true,
      count: workspaces.length,
      workspaces: workspaces.map(w => ({
        id: w.id,
        name: w.name,
        scene: w.scene,
        agents: w.agents.length,
        objects: w.objects.length,
        created: w.created,
        lastActive: w.lastActive,
      })),
    };
  }

  @Post('vr/workspaces')
  async createVRWorkspace(
    @Body() body: { name: string; sceneType: string },
  ) {
    // Use task 1 as default for VR operations
    const result = await this.pkpTaskManager.executeTool(1, 'vr-environment', {
      action: 'create',
      workspaceName: body.name,
      sceneType: body.sceneType,
    });
    return {
      success: result.success,
      message: result.output,
      data: result.metadata,
    };
  }

  @Post('vr/workspaces/:id/join')
  async joinVRWorkspace(
    @Param('id') workspaceId: string,
    @Body() body: { agentId: string; agentName: string },
  ) {
    const result = await this.pkpTaskManager.executeTool(1, 'vr-environment', {
      action: 'join',
      workspaceId,
      agentId: body.agentId,
      agentName: body.agentName,
    });
    return {
      success: result.success,
      message: result.output,
      data: result.metadata,
    };
  }

  @Get('vr/workspaces/:id')
  async getVRWorkspace(@Param('id') id: string) {
    const { vrWorkspaceManager } = require('./agents/pkp-vr-tools');
    const workspace = vrWorkspaceManager.getWorkspace(id);
    
    if (!workspace) {
      return {
        success: false,
        error: 'Workspace not found',
      };
    }

    return {
      success: true,
      data: workspace,
    };
  }
}
