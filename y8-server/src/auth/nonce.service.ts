import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class NonceService {
  private readonly nonces = new Map<string, number>(); // nonce -> expiresAt
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes

  generate(): string {
    const nonce = randomBytes(16).toString('hex');
    this.nonces.set(nonce, Date.now() + this.TTL_MS);
    this.cleanup();
    return nonce;
  }

  /** Returns true and deletes the nonce if valid (one-time use) */
  consume(nonce: string): boolean {
    const expiresAt = this.nonces.get(nonce);
    if (!expiresAt || Date.now() > expiresAt) return false;
    this.nonces.delete(nonce);
    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [nonce, exp] of this.nonces) {
      if (now > exp) this.nonces.delete(nonce);
    }
  }
}
