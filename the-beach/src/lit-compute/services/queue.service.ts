import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface Job {
  id: string;
  submitter: string;
  inputCID: string;
  accessControl: any;
  feeAmount: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  nodeId?: string;
  outputCID?: string;
}

/**
 * Queue Service for Lit Compute Network
 * 
 * Manages job queue operations:
 * - Job submission and validation
 * - Job assignment to available nodes
 * - Job completion and result handling
 */
@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Submit a new encryption job
   */
  async submitJob(jobData: {
    submitter: string;
    inputCID: string;
    accessControl: any;
    feeAmount: string;
  }): Promise<Job> {
    const job: Job = {
      id: this.generateJobId(),
      submitter: jobData.submitter,
      inputCID: jobData.inputCID,
      accessControl: jobData.accessControl,
      feeAmount: jobData.feeAmount,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Add to Redis queue
    await this.redisService.enqueueJob(job);

    this.logger.log(
      `Job submitted: ${job.id} by ${job.submitter.substring(0, 8)}...`,
    );

    // Try to assign to available node immediately
    await this.tryAssignJob(job.id);

    return job;
  }

  /**
   * Get next available job for a node
   */
  async getNextJob(nodeId: string): Promise<Job | null> {
    const job = await this.redisService.dequeueJob();

    if (job) {
      // Assign to requesting node
      await this.redisService.assignJobToNode(job.id, nodeId);
      job.status = 'active';
      job.nodeId = nodeId;
      job.startedAt = Date.now();

      this.logger.log(`Job ${job.id} assigned to node ${nodeId}`);
    }

    return job;
  }

  /**
   * Try to assign a job to an available node
   */
  private async tryAssignJob(jobId: string): Promise<boolean> {
    const availableNodes = await this.redisService.getAvailableNodes();

    if (availableNodes.length === 0) {
      this.logger.debug(`No available nodes for job ${jobId}`);
      return false;
    }

    // Pick node with best reputation (would need to fetch from DB)
    // For now, just pick the first available node
    const selectedNode = availableNodes[0];

    // Send command to node via pub/sub
    await this.redisService.publishNodeCommand(selectedNode, {
      type: 'NEW_JOB',
      jobId,
    });

    this.logger.log(`Job ${jobId} offered to node ${selectedNode}`);
    return true;
  }

  /**
   * Complete a job
   */
  async completeJob(
    jobId: string,
    nodeId: string,
    outputCID: string,
  ): Promise<void> {
    // Verify job is assigned to this node
    const jobStatus = await this.redisService.getJobStatus(jobId);

    if (jobStatus.nodeId !== nodeId) {
      throw new Error(
        `Job ${jobId} is not assigned to node ${nodeId}`,
      );
    }

    // Mark as completed in Redis
    await this.redisService.completeJob(jobId, outputCID);

    // Add payment to pending queue
    await this.redisService.addPendingPayment(nodeId, {
      jobId,
      amount: jobStatus.feeAmount || '0',
    });

    this.logger.log(`Job ${jobId} completed by node ${nodeId}`);
  }

  /**
   * Fail a job
   */
  async failJob(jobId: string, nodeId: string, reason: string): Promise<void> {
    const jobStatus = await this.redisService.getJobStatus(jobId);

    if (jobStatus.nodeId !== nodeId) {
      throw new Error(
        `Job ${jobId} is not assigned to node ${nodeId}`,
      );
    }

    // Update status
    await this.redisService.getJobStatus(jobId); // This would need to be extended

    this.logger.error(
      `Job ${jobId} failed on node ${nodeId}: ${reason}`,
    );

    // Re-queue job for another node
    // TODO: Implement retry logic with max attempts
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<any> {
    return await this.redisService.getJobStatus(jobId);
  }

  /**
   * Get pending jobs count
   */
  async getPendingJobsCount(): Promise<number> {
    const jobs = await this.redisService.getPendingJobs();
    return jobs.length;
  }

  /**
   * Get all pending jobs (for dashboard)
   */
  async getPendingJobs(limit = 100): Promise<Job[]> {
    return await this.redisService.getPendingJobs(limit);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
