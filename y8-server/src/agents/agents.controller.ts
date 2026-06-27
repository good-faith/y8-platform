import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode,
} from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { ServiceRequestDto } from './dto/service-request.dto';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  findAll() { return this.agentsService.findAll(); }

  @Get('dashboard')
  getDashboard() { return this.agentsService.getDashboard(); }

  @Get('leaderboard')
  getLeaderboard() { return this.agentsService.getLeaderboard(); }

  @Post()
  register(@Body() dto: RegisterAgentDto) { return this.agentsService.registerAgent(dto); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.agentsService.findById(id); }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.agentsService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(200)
  decommission(@Param('id') id: string) { return this.agentsService.decommission(id); }

  @Get(':id/sessions')
  getSessions(@Param('id') id: string) { return this.agentsService.getAgentSessions(id); }

  @Post('route')
  route(@Body() dto: ServiceRequestDto) {
    return this.agentsService.route(dto.request, dto.strategy);
  }
}
