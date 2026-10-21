import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * WebAuthn Authentication Provider
 * Supports social login providers for human authentication
 */
export enum AuthProvider {
  GOOGLE = 'google',
  DISCORD = 'discord',
  GITHUB = 'github',
  TWITTER = 'twitter',
  WALLET = 'wallet',
  WEBAUTHN = 'webauthn',
}

/**
 * Human User with Authenticated PKP
 */
export interface AuthenticatedUser {
  userId: string; // Unique user identifier
  email?: string;
  name?: string;
  provider: AuthProvider;
  providerId: string; // Provider-specific ID (e.g., Google user ID)
  
  // Main PKP (minted via Lit Protocol with WebAuthn/Social)
  mainPKP: {
    address: string;
    publicKey: string;
    authMethod: {
      authMethodType: number; // Lit Protocol auth method type
      accessToken?: string;
    };
  };
  
  // Metadata
  createdAt: Date;
  lastLogin: Date;
  tier: 'freemium' | 'base' | 'premium';
  verified: boolean;
}

/**
 * Sub-PKP (Delegated PKP for autonomous work)
 */
export interface SubPKP {
  address: string;
  publicKey: string;
  parentPKP: string; // Main PKP address
  purpose: string; // 'development', 'sales', 'support', etc.
  capabilities: string[];
  
  // Delegation settings
  autonomy: 'low' | 'medium' | 'high'; // How much can it do without approval
  spendingLimit?: number; // Max transaction amount
  approvalRequired: string[]; // Actions requiring main PKP approval
  
  // Status
  status: 'active' | 'paused' | 'revoked';
  createdAt: Date;
  createdBy: string; // Main PKP that created it
  
  // Usage tracking
  tasksCompleted: number;
  totalSpent: number;
  lastActive: Date;
}

/**
 * PKP Hierarchy
 * Maps main PKPs to their sub-PKPs
 */
export interface PKPHierarchy {
  mainPKP: string;
  owner: AuthenticatedUser;
  subPKPs: Map<string, SubPKP>;
  delegationRules: DelegationRule[];
}

/**
 * Delegation Rule
 * Defines what sub-PKPs can do
 */
export interface DelegationRule {
  id: string;
  subPKPAddress: string;
  action: string; // 'deploy', 'commit', 'spend', 'create-agent', etc.
  maxAmount?: number;
  requiresApproval: boolean;
  autoApprove?: boolean;
  conditions?: Record<string, any>;
}

/**
 * Approval Request
 * Sub-PKP requesting permission from main PKP
 */
export interface ApprovalRequest {
  id: string;
  subPKP: string;
  mainPKP: string;
  action: string;
  details: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  expiresAt: Date;
}

/**
 * PKP Authentication Service
 * Handles WebAuthn/Social login for main PKPs and sub-PKP delegation
 */
@Injectable()
export class PKPAuthService {
  private readonly logger = new Logger(PKPAuthService.name);
  
  // Main PKP registry (human-owned)
  private authenticatedUsers = new Map<string, AuthenticatedUser>();
  private usersByEmail = new Map<string, AuthenticatedUser>();
  
  // PKP hierarchy
  private pkpHierarchy = new Map<string, PKPHierarchy>();
  
  // Sub-PKP registry (AI agents)
  private subPKPs = new Map<string, SubPKP>();
  
  // Approval queue
  private approvalRequests = new Map<string, ApprovalRequest>();

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.logger.log('🔐 PKP Authentication Service initialized');
  }

  /**
   * Authenticate human user via WebAuthn/Social login
   * This mints or retrieves the main PKP for the user
   */
  async authenticateUser(params: {
    provider: AuthProvider;
    providerId: string;
    email?: string;
    name?: string;
    accessToken?: string;
  }): Promise<AuthenticatedUser> {
    this.logger.log(`🔑 Authenticating user via ${params.provider}: ${params.email || params.providerId}`);

    // Check if user already exists
    const existingUser = this.usersByEmail.get(params.email || params.providerId);
    if (existingUser) {
      existingUser.lastLogin = new Date();
      this.logger.log(`✅ Existing user authenticated: ${existingUser.userId}`);
      
      this.eventEmitter.emit('user.login', { user: existingUser });
      return existingUser;
    }

    // New user - mint main PKP via Lit Protocol
    const mainPKP = await this.mintMainPKP(params);

    const user: AuthenticatedUser = {
      userId: `user_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      email: params.email,
      name: params.name,
      provider: params.provider,
      providerId: params.providerId,
      mainPKP,
      createdAt: new Date(),
      lastLogin: new Date(),
      tier: 'freemium',
      verified: !!params.email,
    };

    // Store user
    this.authenticatedUsers.set(user.userId, user);
    if (user.email) {
      this.usersByEmail.set(user.email, user);
    }

    // Initialize PKP hierarchy
    this.pkpHierarchy.set(mainPKP.address, {
      mainPKP: mainPKP.address,
      owner: user,
      subPKPs: new Map(),
      delegationRules: [],
    });

    this.logger.log(`✨ New user registered: ${user.userId} -> PKP: ${mainPKP.address}`);
    this.eventEmitter.emit('user.registered', { user });

    return user;
  }

  /**
   * Mint a main PKP via Lit Protocol with WebAuthn/Social auth
   * In production, this calls Lit Protocol's mintWithAuth
   */
  private async mintMainPKP(params: {
    provider: AuthProvider;
    providerId: string;
    accessToken?: string;
  }): Promise<AuthenticatedUser['mainPKP']> {
    // In production, this would call:
    // const pkp = await litNodeClient.mintWithAuth({
    //   authMethod: {
    //     authMethodType: this.getAuthMethodType(params.provider),
    //     accessToken: params.accessToken,
    //   }
    // });

    // For now, simulate PKP minting
    const pkpAddress = `0x${Math.random().toString(16).slice(2, 42).padStart(40, '0')}`;
    const publicKey = `0x04${Math.random().toString(16).slice(2, 130).padStart(128, '0')}`;

    this.logger.log(`🎫 Minted main PKP: ${pkpAddress} (via ${params.provider})`);

    return {
      address: pkpAddress,
      publicKey,
      authMethod: {
        authMethodType: this.getAuthMethodType(params.provider),
        accessToken: params.accessToken,
      },
    };
  }

  /**
   * Get Lit Protocol auth method type for provider
   */
  private getAuthMethodType(provider: AuthProvider): number {
    const authMethodMap: Record<AuthProvider, number> = {
      [AuthProvider.GOOGLE]: 1,
      [AuthProvider.DISCORD]: 2,
      [AuthProvider.GITHUB]: 3,
      [AuthProvider.TWITTER]: 4,
      [AuthProvider.WALLET]: 5,
      [AuthProvider.WEBAUTHN]: 6,
    };
    return authMethodMap[provider];
  }

  /**
   * Create a sub-PKP for autonomous work
   * Main PKP delegates work to sub-PKPs
   */
  async createSubPKP(params: {
    mainPKPAddress: string;
    purpose: string;
    capabilities: string[];
    autonomy?: 'low' | 'medium' | 'high';
    spendingLimit?: number;
    approvalRequired?: string[];
  }): Promise<SubPKP> {
    // Verify main PKP exists
    const hierarchy = this.pkpHierarchy.get(params.mainPKPAddress);
    if (!hierarchy) {
      throw new UnauthorizedException('Main PKP not found or not authenticated');
    }

    // Generate sub-PKP (in production, use Lit Actions to derive)
    const subPKPAddress = `0xSUB${Math.random().toString(16).slice(2, 38).padStart(36, '0')}`;
    const publicKey = `0x04${Math.random().toString(16).slice(2, 130).padStart(128, '0')}`;

    const subPKP: SubPKP = {
      address: subPKPAddress,
      publicKey,
      parentPKP: params.mainPKPAddress,
      purpose: params.purpose,
      capabilities: params.capabilities,
      autonomy: params.autonomy || 'medium',
      spendingLimit: params.spendingLimit,
      approvalRequired: params.approvalRequired || ['deploy', 'spend'],
      status: 'active',
      createdAt: new Date(),
      createdBy: params.mainPKPAddress,
      tasksCompleted: 0,
      totalSpent: 0,
      lastActive: new Date(),
    };

    // Add to hierarchy
    hierarchy.subPKPs.set(subPKPAddress, subPKP);
    this.subPKPs.set(subPKPAddress, subPKP);

    this.logger.log(`🤖 Created sub-PKP: ${subPKPAddress} for ${params.purpose}`);
    this.eventEmitter.emit('subpkp.created', { subPKP, mainPKP: params.mainPKPAddress });

    return subPKP;
  }

  /**
   * Request approval from main PKP for sub-PKP action
   */
  async requestApproval(params: {
    subPKPAddress: string;
    action: string;
    details: Record<string, any>;
    ttlMinutes?: number;
  }): Promise<ApprovalRequest> {
    const subPKP = this.subPKPs.get(params.subPKPAddress);
    if (!subPKP) {
      throw new UnauthorizedException('Sub-PKP not found');
    }

    const requestId = `apr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const request: ApprovalRequest = {
      id: requestId,
      subPKP: params.subPKPAddress,
      mainPKP: subPKP.parentPKP,
      action: params.action,
      details: params.details,
      status: 'pending',
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + (params.ttlMinutes || 60) * 60 * 1000),
    };

    this.approvalRequests.set(requestId, request);

    this.logger.log(`📬 Approval requested: ${requestId} (${params.action})`);
    this.eventEmitter.emit('approval.requested', { request });

    return request;
  }

  /**
   * Approve or reject sub-PKP action
   */
  async respondToApproval(params: {
    requestId: string;
    mainPKPAddress: string;
    approved: boolean;
  }): Promise<ApprovalRequest> {
    const request = this.approvalRequests.get(params.requestId);
    if (!request) {
      throw new UnauthorizedException('Approval request not found');
    }

    if (request.mainPKP !== params.mainPKPAddress) {
      throw new UnauthorizedException('Not authorized to respond to this request');
    }

    if (request.status !== 'pending') {
      throw new UnauthorizedException('Request already processed');
    }

    if (new Date() > request.expiresAt) {
      request.status = 'rejected';
      throw new UnauthorizedException('Request expired');
    }

    request.status = params.approved ? 'approved' : 'rejected';
    request.respondedAt = new Date();

    this.logger.log(`${params.approved ? '✅' : '❌'} Approval ${request.status}: ${params.requestId}`);
    this.eventEmitter.emit('approval.responded', { request });

    return request;
  }

  /**
   * Check if sub-PKP can perform action
   */
  async canPerformAction(params: {
    subPKPAddress: string;
    action: string;
    amount?: number;
  }): Promise<{ allowed: boolean; requiresApproval: boolean; reason?: string }> {
    const subPKP = this.subPKPs.get(params.subPKPAddress);
    if (!subPKP) {
      return { allowed: false, requiresApproval: false, reason: 'Sub-PKP not found' };
    }

    if (subPKP.status !== 'active') {
      return { allowed: false, requiresApproval: false, reason: `Sub-PKP is ${subPKP.status}` };
    }

    // Check if action requires approval
    const requiresApproval = subPKP.approvalRequired.includes(params.action);

    // Check spending limit
    if (params.amount && subPKP.spendingLimit) {
      if (params.amount > subPKP.spendingLimit) {
        return {
          allowed: false,
          requiresApproval: true,
          reason: `Amount exceeds spending limit (${params.amount} > ${subPKP.spendingLimit})`,
        };
      }
    }

    // Check autonomy level
    if (subPKP.autonomy === 'low' && !requiresApproval) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: 'Low autonomy - approval recommended',
      };
    }

    return {
      allowed: true,
      requiresApproval,
    };
  }

  /**
   * Get user by PKP address
   */
  getUserByPKP(pkpAddress: string): AuthenticatedUser | undefined {
    const hierarchy = this.pkpHierarchy.get(pkpAddress);
    return hierarchy?.owner;
  }

  /**
   * Get sub-PKPs for main PKP
   */
  getSubPKPs(mainPKPAddress: string): SubPKP[] {
    const hierarchy = this.pkpHierarchy.get(mainPKPAddress);
    return hierarchy ? Array.from(hierarchy.subPKPs.values()) : [];
  }

  /**
   * Get pending approvals for main PKP
   */
  getPendingApprovals(mainPKPAddress: string): ApprovalRequest[] {
    return Array.from(this.approvalRequests.values()).filter(
      (req) => req.mainPKP === mainPKPAddress && req.status === 'pending',
    );
  }

  /**
   * Revoke sub-PKP
   */
  async revokeSubPKP(params: {
    mainPKPAddress: string;
    subPKPAddress: string;
  }): Promise<void> {
    const hierarchy = this.pkpHierarchy.get(params.mainPKPAddress);
    if (!hierarchy) {
      throw new UnauthorizedException('Main PKP not found');
    }

    const subPKP = hierarchy.subPKPs.get(params.subPKPAddress);
    if (!subPKP) {
      throw new UnauthorizedException('Sub-PKP not found');
    }

    subPKP.status = 'revoked';
    this.logger.log(`🚫 Revoked sub-PKP: ${params.subPKPAddress}`);
    this.eventEmitter.emit('subpkp.revoked', { subPKP });
  }

  /**
   * Get hierarchy for main PKP
   */
  getHierarchy(mainPKPAddress: string): PKPHierarchy | undefined {
    return this.pkpHierarchy.get(mainPKPAddress);
  }

  /**
   * Verify if PKP is a main (human-owned) PKP
   */
  isMainPKP(pkpAddress: string): boolean {
    return this.pkpHierarchy.has(pkpAddress);
  }

  /**
   * Verify if PKP is a sub-PKP
   */
  isSubPKP(pkpAddress: string): boolean {
    return this.subPKPs.has(pkpAddress);
  }

  /**
   * Get parent PKP for sub-PKP
   */
  getParentPKP(subPKPAddress: string): string | undefined {
    return this.subPKPs.get(subPKPAddress)?.parentPKP;
  }
}
