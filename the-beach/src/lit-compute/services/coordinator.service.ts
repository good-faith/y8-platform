import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisService } from './redis.service';

/**
 * Coordinator Service for Lit Compute Network
 * 
 * Orchestrates high-level operations:
 * - Job lifecycle management
 * - Node health monitoring
 * - Payment coordination
 * - System analytics
 */
@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly queueService: QueueService,
    private readonly redisService: RedisService,
  ) {
    // Start background health check
    this.startHealthCheck();
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<any> {
    const redisHealthy = await this.redisService.healthCheck();
    const stats = await this.redisService.getStats();

    return {
      status: redisHealthy ? 'healthy' : 'degraded',
      redis: redisHealthy ? 'connected' : 'disconnected',
      stats,
      timestamp: Date.now(),
    };
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<any> {
    const stats = await this.redisService.getStats();
    const pendingJobs = await this.queueService.getPendingJobs(1000);

    // Calculate average job age
    const now = Date.now();
    const avgJobAge =
      pendingJobs.length > 0
        ? pendingJobs.reduce((sum, job) => sum + (now - job.createdAt), 0) /
          pendingJobs.length
        : 0;

    return {
      ...stats,
      avgJobAgeMs: Math.floor(avgJobAge),
      avgJobAgeMin: Math.floor(avgJobAge / 60000),
      pendingJobsDetailed: pendingJobs.length,
    };
  }

  /**
   * Monitor node health (remove offline nodes)
   */
  private async monitorNodeHealth(): Promise<void> {
    try {
      const availableNodes = await this.redisService.getAvailableNodes();

      for (const nodeId of availableNodes) {
        const status = await this.redisService.getNodeStatus(nodeId);

        if (!status || Object.keys(status).length === 0) {
          // Node TTL expired, remove from available set
          await this.redisService.removeOfflineNode(nodeId);
          this.logger.warn(`Removed offline node: ${nodeId}`);
        } else {
          const lastHeartbeat = parseInt(status.lastHeartbeat);
          const timeSinceHeartbeat = Date.now() - lastHeartbeat;

          // If no heartbeat for >6 minutes, consider offline
          if (timeSinceHeartbeat > 360000) {
            await this.redisService.removeOfflineNode(nodeId);
            this.logger.warn(
              `Removed stale node: ${nodeId} (last heartbeat ${Math.floor(timeSinceHeartbeat / 1000)}s ago)`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Node health monitoring failed:', error);
    }
  }

  /**
   * Start background health check (every 60 seconds)
   */
  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.monitorNodeHealth();
    }, 60000); // Every 60 seconds

    this.logger.log('Health check started (interval: 60s)');
  }

  /**
   * Stop background health check
   */
  stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.logger.log('Health check stopped');
    }
  }
}
