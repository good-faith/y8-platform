import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AgentWalletService } from './agent-wallet.service';
import { AgentWalletController } from './agent-wallet.controller';

/**
 * WalletModule
 *
 * Provides AgentWalletService which wraps @coinbase/agentkit for headless
 * server-side wallet provisioning. Pairs with the `awal` CLI for manual ops:
 *
 *   npx awal balance          — check server wallet balances
 *   npx awal send 10 0x...    — fund an agent wallet
 *   npx awal trade 10 eth usdc — swap tokens
 *   npx awal x402             — x402 payment protocol commands
 */
@Module({
  imports: [ConfigModule],
  controllers: [AgentWalletController],
  providers: [AgentWalletService],
  exports: [AgentWalletService],
})
export class WalletModule {}
