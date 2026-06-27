import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SiweMessage } from 'siwe';
import { NonceService } from './nonce.service';

/** Supported Base chain IDs */
const BASE_CHAIN_IDS = [8453, 84532]; // Mainnet, Sepolia

export interface Y8User {
  id: string;
  walletAddress: string;
  tier: 'free' | 'basic' | 'pro' | 'elite';
  role: 'user' | 'admin';
  createdAt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory user store — replace with DB in production
  private users = new Map<string, Y8User>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly nonceService: NonceService,
  ) {}

  generateNonce() {
    const nonce = this.nonceService.generate();
    return { nonce, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 min TTL
  }

  async verifySiwe(message: string, signature: string) {
    const siweMsg = new SiweMessage(message);

    let fields: SiweMessage;
    try {
      const result = await siweMsg.verify({ signature });
      if (!result.success) throw new Error('Signature invalid');
      fields = result.data;
    } catch (err) {
      this.logger.warn(`SIWE verification failed: ${err.message}`);
      throw new UnauthorizedException('Invalid SIWE signature');
    }

    // Enforce Base chain
    if (!BASE_CHAIN_IDS.includes(fields.chainId)) {
      throw new UnauthorizedException(
        `Chain ${fields.chainId} not supported. Use Base Mainnet (8453) or Base Sepolia (84532).`,
      );
    }

    // Validate nonce
    if (!this.nonceService.consume(fields.nonce)) {
      throw new UnauthorizedException('Nonce invalid or already used');
    }

    const user = this.upsertUser(fields.address.toLowerCase());
    const accessToken = this.jwtService.sign({
      sub: user.id,
      address: user.walletAddress,
      tier: user.tier,
      role: user.role,
    });

    this.logger.log(`✅ SIWE login: ${user.walletAddress} on chain ${fields.chainId}`);
    return { accessToken, user };
  }

  private upsertUser(walletAddress: string): Y8User {
    const existing = this.users.get(walletAddress);
    if (existing) return existing;

    const user: Y8User = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      walletAddress,
      tier: 'free',
      role: 'user',
      createdAt: Date.now(),
    };
    this.users.set(walletAddress, user);
    this.logger.log(`👤 New user registered: ${walletAddress}`);
    return user;
  }

  validateToken(payload: any): Y8User | undefined {
    return this.users.get(payload.address);
  }
}
