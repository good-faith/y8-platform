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
import { RedisService } from '../services/redis.service';
import { QueueService } from '../services/queue.service';
import { IpldService } from '../services/ipld.service';

interface NodeRegistration {
  walletAddress: string;
  publicKey: string;
  capabilities: {
    maxConcurrentJobs: number;
    supportedOperations: string[];
  };
}

interface Heartbeat {
  nodeId: string;
  capacity: number;
  activeJobs: number;
}

/**
 * Nodes Controller
 * 
 * Endpoints for node operators:
 * - Register node with IPLD content addressing
 * - Send heartbeat
 * - Get assigned jobs
 * - Accept/reject jobs
 * 
 * Uses IPLD for cryptographically verifiable node identities
 */
@Controller('lit-compute/nodes')
export class NodesController {
  private readonly logger = new Logger(NodesController.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
    private readonly ipldService: IpldService,
  ) {}

  /**
   * POST /lit-compute/nodes/register
   * Register a new node with IPLD content addressing
   */
  @Post('register')
  async registerNode(@Body() registration: NodeRegistration) {
    try {
      const { walletAddress, publicKey, capabilities } = registration;

      // Validate inputs
      if (!walletAddress || !publicKey) {
        throw new HttpException(
          'Wallet address and public key required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create IPLD CID for node identity (returns string directly)
      const nodeCID = await this.ipldService.createNodeCID({
        walletAddress,
        publicKey,
        capabilities,
        timestamp: Date.now(),
      });

      // Use CID as node ID (content-addressable)
      const nodeId = nodeCID;

      // Create node address using multiaddr format
      const nodeAddress = this.ipldService.createNodeAddress(
        process.env.NODE_IP || '127.0.0.1',
        parseInt(process.env.PORT || '3000'),
        nodeCID,
      );

      // Register in Redis with IPLD metadata
      await this.redisService.registerNodeHeartbeat(nodeId, {
        capacity: capabilities.maxConcurrentJobs || 1,
        walletAddress,
        reputation: 0, // New nodes start with 0 reputation
      });

      this.logger.log(
        `Node registered with IPLD CID: ${nodeId.substring(0, 20)}... (${walletAddress.substring(0, 8)}...)`,
      );

      return {
        success: true,
        nodeId,
        nodeCID: nodeCID,
        nodeAddress,
        message: 'Node registered successfully with IPLD addressing',
        nextHeartbeat: Date.now() + 60000, // 1 minute
        ipldInfo: {
          cid: nodeCID,
          multiaddr: nodeAddress,
          verifiable: true,
        },
      };
    } catch (error) {
      this.logger.error('Node registration failed:', error);
      throw new HttpException(
        'Registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /lit-compute/nodes/heartbeat
   * Send node heartbeat (every 1-5 minutes)
   */
  @Post('heartbeat')
  async heartbeat(@Body() data: Heartbeat) {
    try {
      const { nodeId, capacity, activeJobs } = data;

      if (!nodeId) {
        throw new HttpException('Node ID required', HttpStatus.BAD_REQUEST);
      }

      // Check if node exists
      const nodeStatus = await this.redisService.getNodeStatus(nodeId);

      if (!nodeStatus || Object.keys(nodeStatus).length === 0) {
        throw new HttpException('Node not registered', HttpStatus.NOT_FOUND);
      }

      // Update heartbeat
      await this.redisService.registerNodeHeartbeat(nodeId, {
        capacity,
        walletAddress: nodeStatus.walletAddress,
        reputation: parseInt(nodeStatus.reputation) || 0,
      });

      // Check for new jobs
      const hasCapacity = activeJobs < capacity;
      let newJob: any = null;

      if (hasCapacity) {
        newJob = await this.queueService.getNextJob(nodeId);
      }

      return {
        success: true,
        timestamp: Date.now(),
        newJob: newJob || undefined,
        nextHeartbeat: Date.now() + 60000, // 1 minute
      };
    } catch (error) {
      this.logger.error('Heartbeat failed:', error);
      throw new HttpException(
        error.message || 'Heartbeat failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/nodes/:nodeId/status
   * Get node status
   */
  @Get(':nodeId/status')
  async getNodeStatus(@Param('nodeId') nodeId: string) {
    try {
      const status = await this.redisService.getNodeStatus(nodeId);

      if (!status || Object.keys(status).length === 0) {
        throw new HttpException('Node not found', HttpStatus.NOT_FOUND);
      }

      const activeJobs = await this.redisService.getNodeJobs(nodeId);
      const pendingPayments =
        await this.redisService.getPendingPayments(nodeId);

      return {
        nodeId,
        status: status.status,
        lastHeartbeat: parseInt(status.lastHeartbeat),
        capacity: parseInt(status.capacity),
        reputation: parseInt(status.reputation) || 0,
        activeJobs: activeJobs.length,
        pendingPayments: pendingPayments.length,
        walletAddress: status.walletAddress,
      };
    } catch (error) {
      this.logger.error('Get node status failed:', error);
      throw new HttpException(
        error.message || 'Failed to get node status',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/nodes/:nodeId/jobs
   * Get jobs assigned to this node
   */
  @Get(':nodeId/jobs')
  async getNodeJobs(@Param('nodeId') nodeId: string) {
    try {
      const jobIds = await this.redisService.getNodeJobs(nodeId);

      const jobs = await Promise.all(
        jobIds.map((jobId) => this.redisService.getJobStatus(jobId)),
      );

      return {
        nodeId,
        activeJobs: jobs.length,
        jobs,
      };
    } catch (error) {
      this.logger.error('Get node jobs failed:', error);
      throw new HttpException(
        'Failed to get node jobs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/nodes/:nodeId/payments
   * Get pending payments for node
   */
  @Get(':nodeId/payments')
  async getNodePayments(@Param('nodeId') nodeId: string) {
    try {
      const payments = await this.redisService.getPendingPayments(nodeId);

      const totalPending = payments.reduce(
        (sum, p) => sum + parseFloat(p.amount),
        0,
      );

      return {
        nodeId,
        pendingCount: payments.length,
        totalPending: totalPending.toFixed(4),
        payments,
      };
    } catch (error) {
      this.logger.error('Get node payments failed:', error);
      throw new HttpException(
        'Failed to get node payments',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate node ID from wallet address
   */
  private generateNodeId(walletAddress: string): string {
    return `node_${walletAddress.toLowerCase()}`;
  }
}
