import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PKPAuthService, AuthenticatedUser, SubPKP } from './pkp-auth.service';
import { PKPTaskManagerService, PKPTask, PKPTaskStatus, PKPTaskPriority, PKPAgentType } from '../pkp-task-manager.service';

/**
 * Task Assignment Authorization Level
 */
export enum TaskAuthLevel {
  FREEMIUM = 'freemium',    // Limited task assignments
  BASIC = 'basic',          // More assignments
  PREMIUM = 'premium',      // Unlimited assignments
}

/**
 * Task Assignment Request
 */
export interface TaskAssignmentRequest {
  id: string;
  mainPKP: string;
  subPKP: string;
  taskId: number;
  requestedAt: Date;
  expiresAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  userTier: TaskAuthLevel;
  metadata?: {
    taskTitle: string;
    taskPriority: PKPTaskPriority;
    estimatedHours: number;
    agentType: PKPAgentType;
  };
}

/**
 * Assignment Quota
 */
export interface AssignmentQuota {
  tier: TaskAuthLevel;
  maxPendingTasks: number;
  maxActiveTasksPerSubPKP: number;
  maxSubPKPs: number;
  requiresApproval: boolean;
  canBulkAssign: boolean;
}

/**
 * Task Authorization Service
 * 
 * Manages WebAuthn authorization for assigning tasks to sub-PKPs.
 * Freemium users need to approve each assignment via UI.
 */
@Injectable()
export class TaskAuthorizationService {
  private readonly logger = new Logger(TaskAuthorizationService.name);
  
  // Assignment request queue
  private assignmentRequests = new Map<string, TaskAssignmentRequest>();
  
  // Quota definitions
  private readonly quotas: Map<TaskAuthLevel, AssignmentQuota> = new Map([
    [TaskAuthLevel.FREEMIUM, {
      tier: TaskAuthLevel.FREEMIUM,
      maxPendingTasks: 3,
      maxActiveTasksPerSubPKP: 1,
      maxSubPKPs: 3,
      requiresApproval: true,
      canBulkAssign: false,
    }],
    [TaskAuthLevel.BASIC, {
      tier: TaskAuthLevel.BASIC,
      maxPendingTasks: 25,
      maxActiveTasksPerSubPKP: 3,
      maxSubPKPs: 25,
      requiresApproval: false,
      canBulkAssign: true,
    }],
    [TaskAuthLevel.PREMIUM, {
      tier: TaskAuthLevel.PREMIUM,
      maxPendingTasks: Infinity,
      maxActiveTasksPerSubPKP: Infinity,
      maxSubPKPs: Infinity,
      requiresApproval: false,
      canBulkAssign: true,
    }],
  ]);

  constructor(
    private readonly pkpAuthService: PKPAuthService,
    private readonly taskManagerService: PKPTaskManagerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log('📋 Task Authorization Service initialized');
  }

  /**
   * Request task assignment to a sub-PKP
   * Freemium users must approve via UI, others auto-assign
   */
  async requestTaskAssignment(params: {
    mainPKP: string;
    subPKP: string;
    taskId: number;
    bypassApproval?: boolean; // Admin override
  }): Promise<TaskAssignmentRequest> {
    this.logger.log(`📝 Task assignment requested: Task #${params.taskId} → Sub-PKP ${params.subPKP}`);

    // Verify main PKP exists
    const hierarchy = await this.pkpAuthService.getHierarchy(params.mainPKP);
    if (!hierarchy) {
      throw new NotFoundException(`Main PKP ${params.mainPKP} not found`);
    }

    // Verify sub-PKP belongs to main PKP
    const subPKP = hierarchy.subPKPs.get(params.subPKP);
    if (!subPKP) {
      throw new ForbiddenException(`Sub-PKP ${params.subPKP} not found or not owned by ${params.mainPKP}`);
    }

    // Get task
    const task = this.taskManagerService.getTask(params.taskId);
    if (!task) {
      throw new NotFoundException(`Task #${params.taskId} not found`);
    }

    // Check user tier and quotas
    const userTier = this.mapTierToAuthLevel(hierarchy.owner.tier);
    const quota = this.quotas.get(userTier)!;
    
    await this.validateQuotas(params.mainPKP, params.subPKP, userTier, quota);

    // Create assignment request
    const requestId = `task-assign-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const request: TaskAssignmentRequest = {
      id: requestId,
      mainPKP: params.mainPKP,
      subPKP: params.subPKP,
      taskId: params.taskId,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      status: 'pending',
      userTier,
      metadata: {
        taskTitle: task.title,
        taskPriority: task.priority,
        estimatedHours: task.estimatedHours,
        agentType: task.assignedAgent,
      },
    };

    this.assignmentRequests.set(requestId, request);

    // Emit event for UI notification
    this.eventEmitter.emit('task.assignment.requested', {
      requestId,
      mainPKP: params.mainPKP,
      subPKP: params.subPKP,
      task,
      userTier,
    });

    // Auto-approve for Basic/Premium or if bypass enabled
    if (!quota.requiresApproval || params.bypassApproval) {
      return await this.approveAssignment(requestId, params.mainPKP);
    }

    this.logger.log(`⏳ Task assignment pending approval: ${requestId}`);
    return request;
  }

  /**
   * Approve task assignment (via UI or auto)
   */
  async approveAssignment(requestId: string, mainPKP: string): Promise<TaskAssignmentRequest> {
    const request = this.assignmentRequests.get(requestId);
    if (!request) {
      throw new NotFoundException(`Assignment request ${requestId} not found`);
    }

    if (request.mainPKP !== mainPKP) {
      throw new ForbiddenException('Not authorized to approve this request');
    }

    if (request.status !== 'pending') {
      throw new ForbiddenException(`Request already ${request.status}`);
    }

    // Check if expired
    if (new Date() > request.expiresAt) {
      request.status = 'expired';
      this.assignmentRequests.set(requestId, request);
      throw new ForbiddenException('Assignment request has expired');
    }

    // Approve and assign task
    request.status = 'approved';
    this.assignmentRequests.set(requestId, request);

    // Actually assign the task to the sub-PKP
    await this.taskManagerService.assignTaskToAgent(request.taskId, request.metadata!.agentType);
    
    this.logger.log(`✅ Task assignment approved: Task #${request.taskId} → ${request.subPKP}`);

    // Emit event
    this.eventEmitter.emit('task.assignment.approved', {
      requestId,
      mainPKP: request.mainPKP,
      subPKP: request.subPKP,
      taskId: request.taskId,
    });

    return request;
  }

  /**
   * Reject task assignment
   */
  async rejectAssignment(requestId: string, mainPKP: string, reason?: string): Promise<TaskAssignmentRequest> {
    const request = this.assignmentRequests.get(requestId);
    if (!request) {
      throw new NotFoundException(`Assignment request ${requestId} not found`);
    }

    if (request.mainPKP !== mainPKP) {
      throw new ForbiddenException('Not authorized to reject this request');
    }

    if (request.status !== 'pending') {
      throw new ForbiddenException(`Request already ${request.status}`);
    }

    request.status = 'rejected';
    this.assignmentRequests.set(requestId, request);

    this.logger.log(`❌ Task assignment rejected: ${requestId} - ${reason || 'No reason provided'}`);

    // Emit event
    this.eventEmitter.emit('task.assignment.rejected', {
      requestId,
      mainPKP: request.mainPKP,
      subPKP: request.subPKP,
      taskId: request.taskId,
      reason,
    });

    return request;
  }

  /**
   * Bulk assign tasks (Basic/Premium only)
   */
  async bulkAssignTasks(params: {
    mainPKP: string;
    assignments: Array<{ subPKP: string; taskId: number }>;
  }): Promise<TaskAssignmentRequest[]> {
    this.logger.log(`📚 Bulk task assignment: ${params.assignments.length} tasks`);

    const hierarchy = await this.pkpAuthService.getHierarchy(params.mainPKP);
    if (!hierarchy) {
      throw new NotFoundException(`Main PKP ${params.mainPKP} not found`);
    }

    const userTier = this.mapTierToAuthLevel(hierarchy.owner.tier);
    const quota = this.quotas.get(userTier)!;

    if (!quota.canBulkAssign) {
      throw new ForbiddenException('Bulk assignment not available on Freemium tier. Upgrade to Basic or Premium.');
    }

    const results: TaskAssignmentRequest[] = [];
    
    for (const assignment of params.assignments) {
      try {
        const request = await this.requestTaskAssignment({
          mainPKP: params.mainPKP,
          subPKP: assignment.subPKP,
          taskId: assignment.taskId,
          bypassApproval: !quota.requiresApproval,
        });
        results.push(request);
      } catch (error) {
        this.logger.error(`Failed to assign task ${assignment.taskId}: ${error.message}`);
        // Continue with other assignments
      }
    }

    return results;
  }

  /**
   * Get pending assignments for a main PKP (for UI)
   */
  async getPendingAssignments(mainPKP: string): Promise<TaskAssignmentRequest[]> {
    return Array.from(this.assignmentRequests.values())
      .filter(req => req.mainPKP === mainPKP && req.status === 'pending')
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Get all assignments for a main PKP
   */
  async getAllAssignments(mainPKP: string, status?: string): Promise<TaskAssignmentRequest[]> {
    return Array.from(this.assignmentRequests.values())
      .filter(req => req.mainPKP === mainPKP && (!status || req.status === status))
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  /**
   * Get assignment by ID
   */
  getAssignment(requestId: string): TaskAssignmentRequest | undefined {
    return this.assignmentRequests.get(requestId);
  }

  /**
   * Get quota for a tier
   */
  getQuota(tier: TaskAuthLevel): AssignmentQuota {
    return this.quotas.get(tier)!;
  }

  /**
   * Get user's current usage stats
   */
  async getUserStats(mainPKP: string): Promise<{
    tier: TaskAuthLevel;
    quota: AssignmentQuota;
    usage: {
      pendingTasks: number;
      activeTasks: number;
      subPKPCount: number;
      assignmentsThisMonth: number;
    };
  }> {
    const hierarchy = await this.pkpAuthService.getHierarchy(mainPKP);
    if (!hierarchy) {
      throw new NotFoundException(`Main PKP ${mainPKP} not found`);
    }

    const userTier = this.mapTierToAuthLevel(hierarchy.owner.tier);
    const quota = this.quotas.get(userTier)!;

    // Calculate usage
    const pendingTasks = await this.getPendingAssignments(mainPKP);
    const activeTasks = this.taskManagerService.getActiveTasksForPKP(mainPKP);
    const subPKPCount = hierarchy.subPKPs.size;
    
    // Count assignments this month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const assignmentsThisMonth = Array.from(this.assignmentRequests.values())
      .filter(req => 
        req.mainPKP === mainPKP && 
        req.requestedAt >= monthStart
      ).length;

    return {
      tier: userTier,
      quota,
      usage: {
        pendingTasks: pendingTasks.length,
        activeTasks: activeTasks.length,
        subPKPCount,
        assignmentsThisMonth,
      },
    };
  }

  /**
   * Validate quotas before assignment
   */
  private async validateQuotas(
    mainPKP: string,
    subPKP: string,
    tier: TaskAuthLevel,
    quota: AssignmentQuota,
  ): Promise<void> {
    const stats = await this.getUserStats(mainPKP);

    // Check pending tasks limit
    if (stats.usage.pendingTasks >= quota.maxPendingTasks) {
      throw new ForbiddenException(
        `Pending tasks limit reached (${quota.maxPendingTasks}). ` +
        `Upgrade to ${tier === TaskAuthLevel.FREEMIUM ? 'Basic' : 'Premium'} for more capacity.`
      );
    }

    // Check sub-PKP limit
    if (stats.usage.subPKPCount >= quota.maxSubPKPs) {
      throw new ForbiddenException(
        `Sub-PKP limit reached (${quota.maxSubPKPs}). ` +
        `Upgrade to ${tier === TaskAuthLevel.FREEMIUM ? 'Basic' : 'Premium'} for more sub-PKPs.`
      );
    }

    // Check active tasks per sub-PKP
    const subPKPActiveTasks = this.taskManagerService.getActiveTasksForSubPKP(subPKP);
    if (subPKPActiveTasks.length >= quota.maxActiveTasksPerSubPKP) {
      throw new ForbiddenException(
        `Sub-PKP ${subPKP} has reached its active task limit (${quota.maxActiveTasksPerSubPKP}). ` +
        `Wait for tasks to complete or upgrade tier.`
      );
    }
  }

  /**
   * Map user tier to auth level
   */
  private mapTierToAuthLevel(tier: string): TaskAuthLevel {
    switch (tier) {
      case 'freemium':
        return TaskAuthLevel.FREEMIUM;
      case 'base':
        return TaskAuthLevel.BASIC;
      case 'premium':
        return TaskAuthLevel.PREMIUM;
      default:
        return TaskAuthLevel.FREEMIUM;
    }
  }

  /**
   * Clean up expired requests (run periodically)
   */
  cleanupExpiredRequests(): void {
    const now = new Date();
    let expiredCount = 0;

    for (const [id, request] of this.assignmentRequests.entries()) {
      if (request.status === 'pending' && now > request.expiresAt) {
        request.status = 'expired';
        this.assignmentRequests.set(id, request);
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      this.logger.log(`🧹 Cleaned up ${expiredCount} expired assignment requests`);
    }
  }
}
