import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chain')
@UseGuards(JwtAuthGuard)
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('block')
  getBlock(@Query('chainId') chainId?: string) {
    return this.blockchainService.getBlockNumber(chainId ? parseInt(chainId) : 8453);
  }

  @Get('balance/:address')
  getBalance(@Param('address') address: string, @Query('chainId') chainId?: string) {
    return this.blockchainService.getBalance(
      address as `0x${string}`,
      chainId ? parseInt(chainId) : 8453,
    );
  }

  @Get('resolve/:name')
  resolveName(@Param('name') name: string, @Query('chainId') chainId?: string) {
    return this.blockchainService.resolveBasename(name, chainId ? parseInt(chainId) : 8453);
  }

  @Get('verify/:address')
  verify(@Param('address') address: string, @Query('chainId') chainId?: string) {
    return this.blockchainService.verifyAddressOnBase(address, chainId ? parseInt(chainId) : 8453);
  }
}
