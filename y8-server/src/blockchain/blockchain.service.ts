import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, formatEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly mainnetClient;
  private readonly sepoliaClient;

  constructor(private readonly config: ConfigService) {
    this.mainnetClient = createPublicClient({
      chain: base,
      transport: http(config.get('BASE_RPC_URL', 'https://mainnet.base.org')),
    });
    this.sepoliaClient = createPublicClient({
      chain: baseSepolia,
      transport: http(config.get('BASE_SEPOLIA_RPC_URL', 'https://sepolia.base.org')),
    });
    this.logger.log('⛓️ BlockchainService connected to Base');
  }

  private getClient(chainId: number) {
    return chainId === 84532 ? this.sepoliaClient : this.mainnetClient;
  }

  async getBalance(address: `0x${string}`, chainId = 8453) {
    const client = this.getClient(chainId);
    const balanceWei = await client.getBalance({ address });
    return {
      address,
      chainId,
      balanceWei: balanceWei.toString(),
      balanceEth: formatEther(balanceWei),
    };
  }

  async getBlockNumber(chainId = 8453): Promise<{ chainId: number; blockNumber: string }> {
    const client = this.getClient(chainId);
    const blockNumber = await client.getBlockNumber();
    return { chainId, blockNumber: blockNumber.toString() };
  }

  async resolveBasename(name: string, chainId = 8453) {
    // Base uses L2 resolver — this is a simplified lookup
    const client = this.getClient(chainId);
    try {
      const address = await client.getEnsAddress({ name });
      return { name, address, chainId };
    } catch {
      return { name, address: null, chainId };
    }
  }

  async verifyAddressOnBase(address: string, chainId = 8453) {
    try {
      const client = this.getClient(chainId);
      const balance = await client.getBalance({ address: address as `0x${string}` });
      return { valid: true, address, chainId, hasActivity: balance > 0n };
    } catch {
      return { valid: false, address, chainId };
    }
  }
}
