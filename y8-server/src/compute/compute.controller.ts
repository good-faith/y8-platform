import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ComputeService } from './compute.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateJobDto } from './compute.types';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber } from 'class-validator';

class EnqueueDto {
  @IsString() @IsNotEmpty() type: string;
  @IsObject() payload: Record<string, any>;
  @IsOptional() @IsString() agentId?: string;
  @IsOptional() @IsNumber() priority?: number;
}

@Controller('compute')
@UseGuards(JwtAuthGuard)
export class ComputeController {
  constructor(private readonly computeService: ComputeService) {}

  @Post('jobs')
  enqueue(@Body() dto: EnqueueDto) {
    return this.computeService.enqueue(dto);
  }

  @Get('jobs')
  listJobs(@Query('agentId') agentId?: string) {
    return this.computeService.listJobs(agentId);
  }

  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    return this.computeService.getJob(id);
  }
}
