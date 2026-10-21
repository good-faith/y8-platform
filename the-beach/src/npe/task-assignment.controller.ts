import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskAuthorizationService, TaskAssignmentRequest } from './services/task-authorization.service';

/**
 * Task Assignment Controller
 * 
 * REST API for WebAuthn-authorized task assignments to sub-PKPs
 */
@Controller('npe/tasks/assignments')
export class TaskAssignmentController {
  private readonly logger = new Logger(TaskAssignmentController.name);

  constructor(
    private readonly taskAuthService: TaskAuthorizationService,
  ) {}

  /**
   * Request task assignment to a sub-PKP
   * POST /npe/tasks/assignments/request
   * 
   * @body mainPKP - Main PKP address (human-owned)
   * @body subPKP - Sub-PKP address (AI agent)
   * @body taskId - Task ID to assign
   */
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async requestAssignment(
    @Body() body: {
      mainPKP: string;
      subPKP: string;
      taskId: number;
    },
  ): Promise<TaskAssignmentRequest> {
    this.logger.log(`📝 Assignment request: Task #${body.taskId} → ${body.subPKP}`);
    
    return await this.taskAuthService.requestTaskAssignment({
      mainPKP: body.mainPKP,
      subPKP: body.subPKP,
      taskId: body.taskId,
    });
  }

  /**
   * Approve task assignment
   * POST /npe/tasks/assignments/:id/approve
   * 
   * @param id - Assignment request ID
   * @body mainPKP - Main PKP address (for authorization)
   */
  @Post(':id/approve')
  async approveAssignment(
    @Param('id') id: string,
    @Body() body: { mainPKP: string },
  ): Promise<TaskAssignmentRequest> {
    this.logger.log(`✅ Approving assignment: ${id}`);
    
    return await this.taskAuthService.approveAssignment(id, body.mainPKP);
  }

  /**
   * Reject task assignment
   * POST /npe/tasks/assignments/:id/reject
   * 
   * @param id - Assignment request ID
   * @body mainPKP - Main PKP address (for authorization)
   * @body reason - Optional rejection reason
   */
  @Post(':id/reject')
  async rejectAssignment(
    @Param('id') id: string,
    @Body() body: { mainPKP: string; reason?: string },
  ): Promise<TaskAssignmentRequest> {
    this.logger.log(`❌ Rejecting assignment: ${id}`);
    
    return await this.taskAuthService.rejectAssignment(id, body.mainPKP, body.reason);
  }

  /**
   * Bulk assign tasks (Basic/Premium only)
   * POST /npe/tasks/assignments/bulk
   * 
   * @body mainPKP - Main PKP address
   * @body assignments - Array of {subPKP, taskId} pairs
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkAssign(
    @Body() body: {
      mainPKP: string;
      assignments: Array<{ subPKP: string; taskId: number }>;
    },
  ): Promise<TaskAssignmentRequest[]> {
    this.logger.log(`📚 Bulk assignment: ${body.assignments.length} tasks`);
    
    return await this.taskAuthService.bulkAssignTasks({
      mainPKP: body.mainPKP,
      assignments: body.assignments,
    });
  }

  /**
   * Get pending assignments for approval
   * GET /npe/tasks/assignments/pending?mainPKP=0x123
   */
  @Get('pending')
  async getPendingAssignments(
    @Query('mainPKP') mainPKP: string,
  ): Promise<TaskAssignmentRequest[]> {
    this.logger.log(`📋 Getting pending assignments for ${mainPKP}`);
    
    return await this.taskAuthService.getPendingAssignments(mainPKP);
  }

  /**
   * Get all assignments
   * GET /npe/tasks/assignments?mainPKP=0x123&status=approved
   */
  @Get()
  async getAllAssignments(
    @Query('mainPKP') mainPKP: string,
    @Query('status') status?: string,
  ): Promise<TaskAssignmentRequest[]> {
    this.logger.log(`📋 Getting all assignments for ${mainPKP}`);
    
    return await this.taskAuthService.getAllAssignments(mainPKP, status);
  }

  /**
   * Get specific assignment
   * GET /npe/tasks/assignments/:id
   */
  @Get(':id')
  async getAssignment(@Param('id') id: string): Promise<TaskAssignmentRequest> {
    this.logger.log(`📄 Getting assignment: ${id}`);
    
    const assignment = this.taskAuthService.getAssignment(id);
    if (!assignment) {
      throw new Error(`Assignment ${id} not found`);
    }
    
    return assignment;
  }

  /**
   * Get user stats (quota usage)
   * GET /npe/tasks/assignments/stats/:mainPKP
   */
  @Get('stats/:mainPKP')
  async getUserStats(@Param('mainPKP') mainPKP: string) {
    this.logger.log(`📊 Getting stats for ${mainPKP}`);
    
    return await this.taskAuthService.getUserStats(mainPKP);
  }
}
