import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * StateService — content-addressed key-value store.
 * SHA-256 CID keys for compatibility with IPLD-style lookup.
 * Backed by in-memory Map; swap for Redis (ioredis) in production.
 */
@Injectable()
export class StateService {
  private readonly store = new Map<string, string>();
  private readonly ownerIndex = new Map<string, Set<string>>(); // address -> Set<cid>

  /** Store arbitrary JSON, returns a content-addressed CID */
  put(content: Record<string, any>, ownerAddress?: string): { cid: string } {
    const json = JSON.stringify(content);
    const cid = createHash('sha256').update(json).digest('hex');
    this.store.set(cid, json);
    if (ownerAddress) {
      if (!this.ownerIndex.has(ownerAddress)) this.ownerIndex.set(ownerAddress, new Set());
      this.ownerIndex.get(ownerAddress)!.add(cid);
    }
    return { cid };
  }

  /** Fetch by CID */
  get(cid: string): Record<string, any> {
    const raw = this.store.get(cid);
    if (!raw) throw new NotFoundException(`State ${cid} not found`);
    return JSON.parse(raw);
  }

  /** List all CIDs for a wallet address */
  listByOwner(address: string): string[] {
    return Array.from(this.ownerIndex.get(address.toLowerCase()) ?? []);
  }

  /** Delete a CID */
  delete(cid: string): boolean {
    return this.store.delete(cid);
  }
}
