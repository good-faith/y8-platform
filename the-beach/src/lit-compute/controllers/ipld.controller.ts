import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { IpldService } from '../services/ipld.service';

/**
 * IPLD Controller
 * 
 * Provides HTTP endpoints for IPLD operations:
 * - Resolve CIDs
 * - Verify data integrity
 * - Export/import blocks
 * - Query node graphs
 * 
 * This enables content-addressable, verifiable data structures
 * across the Lit Compute network
 */
@Controller('lit-compute/ipld')
export class IpldController {
  private readonly logger = new Logger(IpldController.name);

  constructor(private readonly ipldService: IpldService) {}

  /**
   * GET /lit-compute/ipld/info
   * Get IPLD system information
   */
  @Get('info')
  getInfo() {
    const stats = this.ipldService.getStats();
    
    return {
      name: 'IPLD Service for Lit Compute Network',
      description: 'Content-addressable, cryptographically verifiable data structures',
      version: '1.0.0',
      features: [
        'Content-addressed node identities',
        'Verifiable job assignments',
        'Distributed data structures (DAGs)',
        'Cross-platform data linking',
        'Cryptographic integrity verification',
      ],
      stats,
      documentation: 'https://ipld.io/',
    };
  }

  /**
   * GET /lit-compute/ipld/resolve/:cid
   * Resolve a CID to get underlying data
   */
  @Get('resolve/:cid')
  async resolveCID(@Param('cid') cidString: string) {
    try {
      const data = await this.ipldService.resolve(cidString);
      const json = await this.ipldService.toJSON(cidString);
      
      return {
        success: true,
        cid: cidString,
        data: json,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(`Failed to resolve CID: ${cidString}`, error);
      throw new HttpException(
        `CID not found or invalid: ${cidString}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * POST /lit-compute/ipld/verify
   * Verify data integrity against a CID
   */
  @Post('verify')
  async verifyIntegrity(
    @Body() body: { cid: string; data: any },
  ) {
    try {
      const { cid, data } = body;
      
      if (!cid || !data) {
        throw new HttpException(
          'CID and data are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const isValid = await this.ipldService.verifyNodeIntegrity(cid, data);

      return {
        success: true,
        cid,
        valid: isValid,
        timestamp: Date.now(),
        message: isValid 
          ? 'Data integrity verified - CID matches content'
          : 'Data integrity check failed - CID does not match content',
      };
    } catch (error) {
      this.logger.error('Integrity verification failed:', error);
      throw new HttpException(
        'Verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/ipld/export/:cid
   * Export a block for IPFS storage or replication
   */
  @Get('export/:cid')
  async exportBlock(@Param('cid') cidString: string) {
    try {
      const bytes = await this.ipldService.exportBlock(cidString);
      
      if (!bytes) {
        throw new HttpException(
          `Block not found for CID: ${cidString}`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        cid: cidString,
        size: bytes.length,
        data: Buffer.from(bytes).toString('base64'),
        encoding: 'base64',
        format: 'dag-cbor',
      };
    } catch (error) {
      this.logger.error(`Failed to export block: ${cidString}`, error);
      throw new HttpException(
        error.message || 'Export failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /lit-compute/ipld/import
   * Import a block from external source
   */
  @Post('import')
  async importBlock(
    @Body() body: { data: string; encoding?: string },
  ) {
    try {
      const { data, encoding = 'base64' } = body;
      
      if (!data) {
        throw new HttpException(
          'Data is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      let bytes: Uint8Array;
      let parsedData: any;
      
      if (encoding === 'base64') {
        bytes = new Uint8Array(Buffer.from(data, 'base64'));
        // Try to parse as JSON
        try {
          parsedData = JSON.parse(Buffer.from(bytes).toString('utf-8'));
        } catch {
          // If not JSON, store as raw bytes
          parsedData = { rawBytes: Array.from(bytes) };
        }
      } else {
        throw new HttpException(
          `Unsupported encoding: ${encoding}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate CID for the imported data
      const cid = await this.ipldService.createJobCID({
        type: 'imported',
        input: parsedData,
        requirements: {},
        timestamp: Date.now(),
      });

      return {
        success: true,
        cid: cid,
        size: bytes.length,
        message: 'Block imported successfully',
      };
    } catch (error) {
      this.logger.error('Failed to import block:', error);
      throw new HttpException(
        error.message || 'Import failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /lit-compute/ipld/stats
   * Get block store statistics
   */
  @Get('stats')
  getStats() {
    const stats = this.ipldService.getStats();
    
    return {
      success: true,
      stats,
      timestamp: Date.now(),
    };
  }

  /**
   * POST /lit-compute/ipld/create-node
   * Create a new node CID (for testing/development)
   */
  @Post('create-node')
  async createNodeCID(
    @Body() body: {
      walletAddress: string;
      publicKey: string;
      capabilities: any;
    },
  ) {
    try {
      const { walletAddress, publicKey, capabilities } = body;

      if (!walletAddress || !publicKey) {
        throw new HttpException(
          'Wallet address and public key are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const cid = await this.ipldService.createNodeCID({
        walletAddress,
        publicKey,
        capabilities,
        timestamp: Date.now(),
      });

      const nodeAddress = this.ipldService.createNodeAddress(
        '127.0.0.1',
        3000,
        cid,
      );

      return {
        success: true,
        cid: cid.toString(),
        nodeAddress,
        walletAddress,
        message: 'Node CID created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create node CID:', error);
      throw new HttpException(
        'Failed to create node CID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /lit-compute/ipld/create-job
   * Create a new job CID (for testing/development)
   */
  @Post('create-job')
  async createJobCID(
    @Body() body: {
      type: string;
      input: any;
      requirements: any;
    },
  ) {
    try {
      const { type, input, requirements } = body;

      if (!type) {
        throw new HttpException(
          'Job type is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const cid = await this.ipldService.createJobCID({
        type,
        input,
        requirements,
        timestamp: Date.now(),
      });

      return {
        success: true,
        cid: cid.toString(),
        type,
        message: 'Job CID created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create job CID:', error);
      throw new HttpException(
        'Failed to create job CID',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /lit-compute/ipld/assign-job
   * Create a job assignment link
   */
  @Post('assign-job')
  async assignJob(
    @Body() body: {
      jobCID: string;
      nodeCID: string;
    },
  ) {
    try {
      const { jobCID: jobCIDString, nodeCID: nodeCIDString } = body;

      if (!jobCIDString || !nodeCIDString) {
        throw new HttpException(
          'Job CID and Node CID are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      // CIDs are already strings in our implementation
      const jobCID = jobCIDString;
      const nodeCID = nodeCIDString;

      const assignmentCID = await this.ipldService.createJobAssignment(
        jobCID,
        nodeCID,
      );

      return {
        success: true,
        assignmentCID: assignmentCID,
        jobCID: jobCIDString,
        nodeCID: nodeCIDString,
        message: 'Job assignment created successfully',
      };
    } catch (error) {
      this.logger.error('Failed to create job assignment:', error);
      throw new HttpException(
        error.message || 'Failed to create job assignment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
