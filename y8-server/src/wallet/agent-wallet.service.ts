import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AgentWalletService
 *
 * Wraps the Coinbase AgentKit (CdpEvmWalletProvider) to provision and manage
 * autonomous Base-chain wallets for Y8 agents.
 *
 * ─── How it fits with the Agentic Wallet CLI (awal) ────────────────────────
 * The `awal` CLI is great for interactive ops (funding, checking balances,
 * manual sends) but requires email OTP — not suitable for headless servers.
 * AgentKit uses the same CDP infrastructure via API keys, making it the
 * correct server-side companion:
 *
 *   Server creates wallets    →  AgentKit (this service)
 *   You monitor/fund wallets  →  npx awal balance / send / trade
 *   Agents execute x402 pays  →  AgentKit Actions (send, trade actions)
 *
 * ─── Required env vars ──────────────────────────────────────────────────────
 *   CDP_API_KEY_ID       — from portal.cdp.coinbase.com
 *   CDP_API_KEY_SECRET   — from portal.cdp.coinbase.com
 *   CDP_WALLET_SECRET    — optional, used for deterministic wallet derivation
 *   CDP_NETWORK_ID       — 'base-mainnet' | 'base-sepolia' (default: base-sepolia)
 */
@Injectable()
export class AgentWalletService implements OnModuleInit {
  private readonly logger = new Logger(AgentWalletService.name);

  // AgentKit instance — typed as any to avoid hard dep when package not present
  private agentKit: any = null;
  private walletProvider: any = null;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.enabled = !!(
      config.get('CDP_API_KEY_ID') &&
      config.get('CDP_API_KEY_SECRET')
    );
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn(
        '⚠️  AgentKit disabled — set CDP_API_KEY_ID + CDP_API_KEY_SECRET to enable agent wallets',
      );
      return;
    }

    try {
      // Dynamic import so the module still starts without @coinbase/agentkit installed
      const agentkit = await import('@coinbase/agentkit').catch(() => null);
      if (!agentkit) {
        this.logger.error(
          '❌ @coinbase/agentkit not installed. Run: npm install @coinbase/agentkit',
        );
        return;
      }

      const { AgentKit, CdpEvmWalletProvider } = agentkit;

      const walletConfig = {
        apiKeyId:     this.config.getOrThrow<string>('CDP_API_KEY_ID'),
        apiKeySecret: this.config.getOrThrow<string>('CDP_API_KEY_SECRET'),
        networkId:    this.config.get<string>('CDP_NETWORK_ID') ?? 'base-sepolia',
        ...(this.config.get('CDP_WALLET_SECRET')
          ? { walletSecret: this.config.get<string>('CDP_WALLET_SECRET') }
          : {}),
      };

      this.walletProvider = await CdpEvmWalletProvider.configureWithWallet(walletConfig);

      this.agentKit = await AgentKit.from({
        walletProvider: this.walletProvider,
      });

      const address = await this.walletProvider.getAddress();
      this.logger.log(
        `✅ AgentKit initialised on ${walletConfig.networkId} — server wallet: ${address}`,
      );
    } catch (err: any) {
      this.logger.error(`❌ AgentKit init failed: ${err.message}`);
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  isEnabled(): boolean {
    return this.enabled && !!this.agentKit;
  }

  /**
   * Returns the server-level CDP wallet address.
   * Individual agent wallets are derived from the same seed using the agent ID
   * as an idempotency key, so each agent always gets the same address.
   */
  async getServerWalletAddress(): Promise<string | null> {
    if (!this.walletProvider) return null;
    try {
      return await this.walletProvider.getAddress();
    } catch {
      return null;
    }
  }

  /**
   * Provision a wallet for a specific agent.
   * Uses the agent's ID as the idempotency key — calling this multiple times
   * with the same agentId always returns the same address.
   */
  async provisionAgentWallet(agentId: string): Promise<{ address: string; walletId: string } | null> {
    if (!this.enabled) return null;

    try {
      const agentkit = await import('@coinbase/agentkit').catch(() => null);
      if (!agentkit) return null;

      const { CdpEvmWalletProvider } = agentkit;

      const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
        apiKeyId:      this.config.getOrThrow<string>('CDP_API_KEY_ID'),
        apiKeySecret:  this.config.getOrThrow<string>('CDP_API_KEY_SECRET'),
        networkId:     this.config.get<string>('CDP_NETWORK_ID') ?? 'base-sepolia',
        idempotencyKey: `y8-agent-${agentId}`,
        ...(this.config.get('CDP_WALLET_SECRET')
          ? { walletSecret: this.config.get<string>('CDP_WALLET_SECRET') }
          : {}),
      });

      const address = await walletProvider.getAddress();
      const walletId = `cdp:${agentId}`;

      this.logger.log(`💼 Agent wallet provisioned: ${address} (agentId: ${agentId})`);
      return { address, walletId };
    } catch (err: any) {
      this.logger.error(`Failed to provision wallet for agent ${agentId}: ${err.message}`);
      return null;
    }
  }

  /**
   * Execute an x402 payment from the server wallet to a service endpoint.
   * Used when AI agents need to autonomously pay for API services.
   */
  async executeX402Payment(
    serviceUrl: string,
    amountUsdc: number,
  ): Promise<{ txHash: string } | null> {
    if (!this.agentKit) return null;

    try {
      // The AgentKit actions handle x402 protocol automatically
      const actions = this.agentKit.getActions?.() ?? [];
      const sendAction = actions.find((a: any) => a.name === 'send_usdc' || a.name === 'transfer');

      if (!sendAction) {
        this.logger.warn('send action not available in current AgentKit build');
        return null;
      }

      const result = await sendAction.invoke({
        amount: String(amountUsdc),
        recipient: serviceUrl,
        token: 'usdc',
      });

      return { txHash: result?.transactionHash ?? result?.hash ?? 'unknown' };
    } catch (err: any) {
      this.logger.error(`x402 payment failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Get balances for the server wallet.
   * Same data as `npx awal balance` but accessible in-process.
   */
  async getBalances(): Promise<Record<string, string> | null> {
    if (!this.walletProvider) return null;
    try {
      const balances = await this.walletProvider.getBalance?.();
      return balances ?? null;
    } catch {
      return null;
    }
  }
}
