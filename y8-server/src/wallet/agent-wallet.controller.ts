import { Controller, Get, Post, Param, UseGuards, Body } from '@nestjs/common';
import { AgentWalletService } from './agent-wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

/**
 * AgentWalletController
 *
 * REST interface for agent wallet management.
 * Admin-only endpoints — protected by JWT + role guard.
 */
@Controller('wallet')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AgentWalletController {
  constructor(private readonly walletService: AgentWalletService) {}

  /** GET /wallet/status — returns whether AgentKit is initialised */
  @Get('status')
  @Roles('admin', 'user')
  getStatus() {
    return {
      enabled: this.walletService.isEnabled(),
      provider: 'coinbase-agentkit-v2',
      network: process.env.CDP_NETWORK_ID ?? 'base-sepolia',
    };
  }

  /** GET /wallet/address — returns the server-level CDP wallet address */
  @Get('address')
  @Roles('admin')
  async getAddress() {
    const address = await this.walletService.getServerWalletAddress();
    return { address };
  }

  /** GET /wallet/balances — returns token balances for the server wallet */
  @Get('balances')
  @Roles('admin')
  async getBalances() {
    const balances = await this.walletService.getBalances();
    return { balances };
  }

  /**
   * POST /wallet/agents/:agentId/provision
   * Provisions a deterministic CDP wallet for the given agent.
   * Idempotent — calling multiple times returns the same address.
   */
  @Post('agents/:agentId/provision')
  @Roles('admin')
  async provisionAgentWallet(@Param('agentId') agentId: string) {
    const result = await this.walletService.provisionAgentWallet(agentId);
    if (!result) {
      return { error: 'AgentKit not enabled or wallet provisioning failed' };
    }
    return result;
  }

  /**
   * POST /wallet/x402/pay
   * Execute an x402 protocol payment to a service URL.
   * Body: { serviceUrl: string, amountUsdc: number }
   */
  @Post('x402/pay')
  @Roles('admin')
  async x402Pay(@Body() body: { serviceUrl: string; amountUsdc: number }) {
    const result = await this.walletService.executeX402Payment(
      body.serviceUrl,
      body.amountUsdc,
    );
    if (!result) {
      return { error: 'x402 payment failed or AgentKit not enabled' };
    }
    return result;
  }
}
