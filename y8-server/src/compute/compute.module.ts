import { Module } from '@nestjs/common';
import { ComputeController } from './compute.controller';
import { ComputeService } from './compute.service';
import { ComputeGateway } from './compute.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ComputeController],
  providers: [ComputeService, ComputeGateway],
  exports: [ComputeService],
})
export class ComputeModule {}
