import { Controller, Post, Get, Body, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { PKPAuthService, AuthProvider, AuthenticatedUser, SubPKP, ApprovalRequest } from './services/pkp-auth.service';

/**
 * PKP Authentication Controller
 * Handles WebAuthn/Social login and PKP hierarchy management
 */
@Controller('pkp')
export class PKPAuthController {
  constructor(private readonly pkpAuthService: PKPAuthService) {}

  /**
   * Authenticate user via social login or WebAuthn
   * POST /pkp/auth/login
   * 
   * Integration with Y8 App:
   * - User logs in via Lit Protocol auth (Google, Discord, etc.)
   * - Y8 App sends auth details to this endpoint
   * - Returns main PKP for the user
   */
  @Post('auth/login')
  async login(@Body() body: {
    provider: AuthProvider;
    providerId: string;
    email?: string;
    name?: string;
    accessToken?: string;
  }): Promise<{ user: AuthenticatedUser; message: string }> {
    const user = await this.pkpAuthService.authenticateUser({
      provider: body.provider,
      providerId: body.providerId,
      email: body.email,
      name: body.name,
      accessToken: body.accessToken,
    });

    return {
      user,
      message: user.createdAt.getTime() === user.lastLogin.getTime()
        ? 'Welcome! Your main PKP has been created.'
        : 'Welcome back!',
    };
  }

  /**
   * Get authenticated user info
   * GET /pkp/auth/me
   */
  @Get('auth/me')
  async getMe(@Headers('x-pkp-address') pkpAddress: string): Promise<AuthenticatedUser> {
    const user = this.pkpAuthService.getUserByPKP(pkpAddress);
    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }
    return user;
  }

  /**
   * Create a sub-PKP for autonomous work
   * POST /pkp/sub
   * 
   * This allows main PKP to delegate work to AI agents
   */
  @Post('sub')
  async createSubPKP(
    @Headers('x-pkp-address') mainPKPAddress: string,
    @Body() body: {
      purpose: string;
      capabilities: string[];
      autonomy?: 'low' | 'medium' | 'high';
      spendingLimit?: number;
      approvalRequired?: string[];
    },
  ): Promise<{ subPKP: SubPKP; message: string }> {
    const subPKP = await this.pkpAuthService.createSubPKP({
      mainPKPAddress,
      purpose: body.purpose,
      capabilities: body.capabilities,
      autonomy: body.autonomy,
      spendingLimit: body.spendingLimit,
      approvalRequired: body.approvalRequired,
    });

    return {
      subPKP,
      message: `Sub-PKP created for ${body.purpose}. It can now perform autonomous work.`,
    };
  }

  /**
   * List all sub-PKPs for authenticated user
   * GET /pkp/sub
   */
  @Get('sub')
  async listSubPKPs(@Headers('x-pkp-address') mainPKPAddress: string): Promise<{
    subPKPs: SubPKP[];
    count: number;
  }> {
    const subPKPs = this.pkpAuthService.getSubPKPs(mainPKPAddress);
    return {
      subPKPs,
      count: subPKPs.length,
    };
  }

  /**
   * Get specific sub-PKP details
   * GET /pkp/sub/:address
   */
  @Get('sub/:address')
  async getSubPKP(
    @Headers('x-pkp-address') mainPKPAddress: string,
    @Param('address') subPKPAddress: string,
  ): Promise<SubPKP> {
    const subPKPs = this.pkpAuthService.getSubPKPs(mainPKPAddress);
    const subPKP = subPKPs.find((s) => s.address === subPKPAddress);
    
    if (!subPKP) {
      throw new UnauthorizedException('Sub-PKP not found or not owned by you');
    }
    
    return subPKP;
  }

  /**
   * Request approval for sub-PKP action
   * POST /pkp/approval/request
   * 
   * Sub-PKPs use this when they need permission
   */
  @Post('approval/request')
  async requestApproval(@Body() body: {
    subPKPAddress: string;
    action: string;
    details: Record<string, any>;
    ttlMinutes?: number;
  }): Promise<{ request: ApprovalRequest; message: string }> {
    const request = await this.pkpAuthService.requestApproval({
      subPKPAddress: body.subPKPAddress,
      action: body.action,
      details: body.details,
      ttlMinutes: body.ttlMinutes,
    });

    return {
      request,
      message: 'Approval request sent to main PKP. Waiting for response...',
    };
  }

  /**
   * Respond to approval request
   * POST /pkp/approval/:requestId/respond
   * 
   * Main PKP approves or rejects sub-PKP actions
   */
  @Post('approval/:requestId/respond')
  async respondToApproval(
    @Headers('x-pkp-address') mainPKPAddress: string,
    @Param('requestId') requestId: string,
    @Body() body: { approved: boolean },
  ): Promise<{ request: ApprovalRequest; message: string }> {
    const request = await this.pkpAuthService.respondToApproval({
      requestId,
      mainPKPAddress,
      approved: body.approved,
    });

    return {
      request,
      message: body.approved
        ? 'Action approved. Sub-PKP can proceed.'
        : 'Action rejected.',
    };
  }

  /**
   * Get pending approvals for main PKP
   * GET /pkp/approval/pending
   */
  @Get('approval/pending')
  async getPendingApprovals(@Headers('x-pkp-address') mainPKPAddress: string): Promise<{
    approvals: ApprovalRequest[];
    count: number;
  }> {
    const approvals = this.pkpAuthService.getPendingApprovals(mainPKPAddress);
    return {
      approvals,
      count: approvals.length,
    };
  }

  /**
   * Check if sub-PKP can perform action
   * POST /pkp/sub/:address/can-perform
   */
  @Post('sub/:address/can-perform')
  async canPerformAction(
    @Param('address') subPKPAddress: string,
    @Body() body: { action: string; amount?: number },
  ): Promise<{
    allowed: boolean;
    requiresApproval: boolean;
    reason?: string;
  }> {
    return await this.pkpAuthService.canPerformAction({
      subPKPAddress,
      action: body.action,
      amount: body.amount,
    });
  }

  /**
   * Revoke sub-PKP
   * POST /pkp/sub/:address/revoke
   */
  @Post('sub/:address/revoke')
  async revokeSubPKP(
    @Headers('x-pkp-address') mainPKPAddress: string,
    @Param('address') subPKPAddress: string,
  ): Promise<{ message: string }> {
    await this.pkpAuthService.revokeSubPKP({
      mainPKPAddress,
      subPKPAddress,
    });

    return {
      message: `Sub-PKP ${subPKPAddress} has been revoked.`,
    };
  }

  /**
   * Get PKP hierarchy
   * GET /pkp/hierarchy
   */
  @Get('hierarchy')
  async getHierarchy(@Headers('x-pkp-address') mainPKPAddress: string): Promise<{
    mainPKP: string;
    owner: AuthenticatedUser;
    subPKPs: SubPKP[];
    totalSubPKPs: number;
    activeSubPKPs: number;
  }> {
    const hierarchy = this.pkpAuthService.getHierarchy(mainPKPAddress);
    if (!hierarchy) {
      throw new UnauthorizedException('Main PKP not found');
    }

    const subPKPs = Array.from(hierarchy.subPKPs.values());
    const activeSubPKPs = subPKPs.filter((s) => s.status === 'active').length;

    return {
      mainPKP: hierarchy.mainPKP,
      owner: hierarchy.owner,
      subPKPs,
      totalSubPKPs: subPKPs.length,
      activeSubPKPs,
    };
  }

  /**
   * Verify PKP type
   * GET /pkp/verify/:address
   */
  @Get('verify/:address')
  async verifyPKP(@Param('address') pkpAddress: string): Promise<{
    address: string;
    type: 'main' | 'sub' | 'unknown';
    parentPKP?: string;
  }> {
    const isMain = this.pkpAuthService.isMainPKP(pkpAddress);
    if (isMain) {
      return { address: pkpAddress, type: 'main' };
    }

    const isSub = this.pkpAuthService.isSubPKP(pkpAddress);
    if (isSub) {
      const parentPKP = this.pkpAuthService.getParentPKP(pkpAddress);
      return { address: pkpAddress, type: 'sub', parentPKP };
    }

    return { address: pkpAddress, type: 'unknown' };
  }
}
