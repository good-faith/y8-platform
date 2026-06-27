import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { StateService } from './state.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('state')
@UseGuards(JwtAuthGuard)
export class StateController {
  constructor(private readonly stateService: StateService) {}

  @Post()
  put(@Body() content: Record<string, any>, @CurrentUser() user: any) {
    return this.stateService.put(content, user?.walletAddress);
  }

  @Get(':cid')
  get(@Param('cid') cid: string) {
    return this.stateService.get(cid);
  }

  @Get('owner/:address')
  listByOwner(@Param('address') address: string) {
    return { cids: this.stateService.listByOwner(address) };
  }

  @Delete(':cid')
  delete(@Param('cid') cid: string) {
    return { deleted: this.stateService.delete(cid) };
  }
}
