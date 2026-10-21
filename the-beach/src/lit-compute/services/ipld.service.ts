import { Injectable, Logger } from '@nestjs/common';
import * as objectHash from 'object-hash';
import bs58 from 'bs58';
import { createHash } from 'crypto';

/**
 * IPLD Service for Content-Addressable Node Network
 * 
 * Uses content-addressable hashing for:
 * - Content-addressable node identities
 * - Cryptographically verifiable node data
 * - Distributed data structures
 * - Cross-platform data linking
 * 
 * This implementation uses CommonJS-compatible libraries for NestJS compatibility
 */
@Injectable()
export class IpldService {
  private readonly logger = new Logger(IpldService.name);
  
  // Local block store (in production, use IPFS or persistent storage)
  private blockStore = new Map<string, any>();

  /**
   * Create a CID-like identifier for node data
   * 
   * Format: base58(sha256(objectHash(nodeData)))
   * This creates a cryptographically secure, content-addressed identifier
   */
  async createNodeCID(nodeData: {
    walletAddress: string;
    publicKey: string;
    capabilities: any;
    timestamp: number;
  }): Promise<string> {
    try {
      // Create deterministic hash of the node data
      const dataHash = objectHash(nodeData, { algorithm: 'sha256', encoding: 'hex' });
      
      // Create a CID-like identifier using base58
      const hash = createHash('sha256').update(dataHash).digest();
      const cid = 'z' + bs58.encode(hash); // 'z' prefix indicates base58btc encoding
      
      // Store the block
      this.blockStore.set(cid, nodeData);

      this.logger.log(`Created node CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Failed to create node CID:', error);
      throw error;
    }
  }

  /**
   * Create a CID for job data
   */
  async createJobCID(jobData: {
    type: string;
    input: any;
    requirements: any;
    timestamp: number;
  }): Promise<string> {
    try {
      const dataHash = objectHash(jobData, { algorithm: 'sha256', encoding: 'hex' });
      const hash = createHash('sha256').update(dataHash).digest();
      const cid = 'z' + bs58.encode(hash);
      
      this.blockStore.set(cid, jobData);

      this.logger.log(`Created job CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Failed to create job CID:', error);
      throw error;
    }
  }

  /**
   * Create a node graph linking multiple nodes
   */
  async createNodeGraph(
    nodeCID: string,
    connections: string[],
    metadata: any,
  ): Promise<string> {
    try {
      const graph = {
        node: nodeCID,
        connections,
        metadata,
        createdAt: Date.now(),
      };

      const dataHash = objectHash(graph, { algorithm: 'sha256', encoding: 'hex' });
      const hash = createHash('sha256').update(dataHash).digest();
      const cid = 'z' + bs58.encode(hash);

      this.blockStore.set(cid, graph);

      this.logger.log(`Created node graph CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Failed to create node graph:', error);
      throw error;
    }
  }

  /**
   * Resolve a CID to its underlying data
   */
  async resolve<T = any>(cid: string): Promise<T> {
    try {
      const data = this.blockStore.get(cid);

      if (!data) {
        throw new Error(`Block not found for CID: ${cid}`);
      }

      return data as T;
    } catch (error) {
      this.logger.error('Failed to resolve CID:', error);
      throw error;
    }
  }

  /**
   * Create a multiaddr-style address for a node
   * Format: /ip4/{ip}/tcp/{port}/ipld/{cid}
   */
  createNodeAddress(
    ip: string,
    port: number,
    nodeCID: string,
  ): string {
    return `/ip4/${ip}/tcp/${port}/ipld/${nodeCID}`;
  }

  /**
   * Parse a multiaddr-style node address
   */
  parseNodeAddress(address: string): {
    ip: string;
    port: number;
    cid: string;
  } | null {
    try {
      const parts = address.split('/').filter(p => p);
      
      if (parts.length < 6 || parts[0] !== 'ip4' || parts[2] !== 'tcp' || parts[4] !== 'ipld') {
        return null;
      }

      return {
        ip: parts[1],
        port: parseInt(parts[3], 10),
        cid: parts[5],
      };
    } catch (error) {
      this.logger.error('Failed to parse node address:', error);
      return null;
    }
  }

  /**
   * Verify that node data matches its CID
   */
  async verifyNodeIntegrity(
    nodeCID: string,
    nodeData: any,
  ): Promise<boolean> {
    try {
      // Recompute the CID from the data
      const dataHash = objectHash(nodeData, { algorithm: 'sha256', encoding: 'hex' });
      const hash = createHash('sha256').update(dataHash).digest();
      const computedCID = 'z' + bs58.encode(hash);

      const isValid = nodeCID === computedCID;

      if (!isValid) {
        this.logger.warn(
          `Node integrity verification failed. Expected: ${nodeCID}, Computed: ${computedCID}`,
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error('Failed to verify node integrity:', error);
      return false;
    }
  }

  /**
   * Create a job assignment linking a job to a node
   */
  async createJobAssignment(
    jobCID: string,
    nodeCID: string,
    assignedAt: number = Date.now(),
  ): Promise<string> {
    try {
      const assignment = {
        job: jobCID,
        node: nodeCID,
        assignedAt,
        status: 'assigned',
      };

      const dataHash = objectHash(assignment, { algorithm: 'sha256', encoding: 'hex' });
      const hash = createHash('sha256').update(dataHash).digest();
      const cid = 'z' + bs58.encode(hash);

      this.blockStore.set(cid, assignment);

      this.logger.log(
        `Created job assignment CID: ${cid} (Job: ${jobCID} -> Node: ${nodeCID})`,
      );

      return cid;
    } catch (error) {
      this.logger.error('Failed to create job assignment:', error);
      throw error;
    }
  }

  /**
   * Create a result verification record
   */
  async createResultVerification(
    assignmentCID: string,
    resultData: any,
    completedAt: number = Date.now(),
  ): Promise<string> {
    try {
      const verification = {
        assignment: assignmentCID,
        result: resultData,
        completedAt,
        verified: true,
      };

      const dataHash = objectHash(verification, { algorithm: 'sha256', encoding: 'hex' });
      const hash = createHash('sha256').update(dataHash).digest();
      const cid = 'z' + bs58.encode(hash);

      this.blockStore.set(cid, verification);

      this.logger.log(`Created result verification CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Failed to create result verification:', error);
      throw error;
    }
  }

  /**
   * Export a block for external storage (e.g., IPFS)
   */
  async exportBlock(cid: string): Promise<any | null> {
    const data = this.blockStore.get(cid);
    return data || null;
  }

  /**
   * Import a block from external storage
   */
  async importBlock(cid: string, data: any): Promise<string> {
    try {
      this.blockStore.set(cid, data);
      this.logger.log(`Imported block with CID: ${cid}`);
      return cid;
    } catch (error) {
      this.logger.error('Failed to import block:', error);
      throw error;
    }
  }

  /**
   * Convert stored data to JSON
   */
  async toJSON(cid: string): Promise<any> {
    try {
      const data = await this.resolve(cid);
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      this.logger.error('Failed to convert to JSON:', error);
      throw error;
    }
  }

  /**
   * Get statistics about the block store
   */
  getStats(): {
    totalBlocks: number;
    blockCIDs: string[];
  } {
    return {
      totalBlocks: this.blockStore.size,
      blockCIDs: Array.from(this.blockStore.keys()),
    };
  }
}
