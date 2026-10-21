import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueueService, Job } from '../services/queue.service';
import { RedisService } from '../services/redis.service';

interface JobSubmission {
  submitter: string;
  inputCID: string;
  accessControl: any;
  feeAmount: string;
}

interface JobCompletion {
  nodeId: string;
  outputCID: string;
}

/**
 * Jobs Controller
 * 
 * Endpoints for job management:
 * - Submit encryption job
 * - Get job status
 * - Complete job (from node)
 * - Get pending jobs (dashboard)
 */
@Controller('lit-compute/jobs')
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * POST /lit-compute/jobs/submit
   * Submit a new encryption job
   */
  @Post('submit')
  async submitJob(@Body() submission: JobSubmission) {
    try {
      const { submitter, inputCID, accessControl, feeAmount } = submission;

      // Validate inputs
      if (!submitter || !inputCID || !accessControl) {
        throw new HttpException(
          'Missing required fields',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate fee amount
      const fee = parseFloat(feeAmount);
      if (isNaN(fee) || fee <= 0) {
        throw new HttpException('Invalid fee amount', HttpStatus.BAD_REQUEST);
      }

      // Submit job to queue
      const job = await this.queueService.submitJob({
        submitter,
        inputCID,
        accessControl,
        feeAmount,
      });

      this.logger.log(
        `Job submitted: ${job.id} by ${submitter.substring(0, 8)}...`,
      );

      return {
        success: true,
        job: {
          id: job.id,
          status: job.status,
          submitter: job.submitter,
          inputCID: job.inputCID,
          feeAmount: job.feeAmount,
          createdAt: job.createdAt,
        },
        message: 'Job submitted successfully',
      };
    } catch (error) {
      this.logger.error('Job submission failed:', error);
      throw new HttpException(
        error.message || 'Job submission failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/jobs/:jobId
   * Get job status
   */
  @Get(':jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const status = await this.queueService.getJobStatus(jobId);

      if (!status || Object.keys(status).length === 0) {
        throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
      }

      return {
        jobId,
        status: status.status,
        nodeId: status.nodeId || null,
        outputCID: status.outputCID || null,
        startedAt: parseInt(status.startedAt) || null,
        completedAt: parseInt(status.completedAt) || null,
      };
    } catch (error) {
      this.logger.error('Get job status failed:', error);
      throw new HttpException(
        error.message || 'Failed to get job status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /lit-compute/jobs/:jobId/complete
   * Complete a job (called by node)
   */
  @Post(':jobId/complete')
  async completeJob(
    @Param('jobId') jobId: string,
    @Body() completion: JobCompletion,
  ) {
    try {
      const { nodeId, outputCID } = completion;

      if (!nodeId || !outputCID) {
        throw new HttpException(
          'Node ID and output CID required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Complete job
      await this.queueService.completeJob(jobId, nodeId, outputCID);

      this.logger.log(`Job ${jobId} completed by node ${nodeId}`);

      return {
        success: true,
        jobId,
        status: 'completed',
        outputCID,
        completedAt: Date.now(),
      };
    } catch (error) {
      this.logger.error('Job completion failed:', error);
      throw new HttpException(
        error.message || 'Job completion failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/jobs/pending/list
   * Get list of pending jobs (for dashboard)
   */
  @Get('pending/list')
  async getPendingJobs() {
    try {
      const jobs = await this.queueService.getPendingJobs(50);

      return {
        count: jobs.length,
        jobs: jobs.map((job) => ({
          id: job.id,
          submitter: job.submitter,
          feeAmount: job.feeAmount,
          createdAt: job.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('Get pending jobs failed:', error);
      throw new HttpException(
        'Failed to get pending jobs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/jobs/stats
   * Get job statistics
   */
  @Get('stats')
  async getJobStats() {
    try {
      const stats = await this.redisService.getStats();

      return {
        pendingJobs: stats.pendingJobs,
        completedJobs: stats.completedJobs,
        activeNodes: stats.activeNodes,
        timestamp: stats.timestamp,
      };
    } catch (error) {
      this.logger.error('Get job stats failed:', error);
      throw new HttpException(
        'Failed to get job stats',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
