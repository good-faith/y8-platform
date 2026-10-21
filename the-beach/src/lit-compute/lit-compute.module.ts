import { Module } from '@nestjs/common';
import { NodesController } from './controllers/nodes.controller';
import { JobsController } from './controllers/jobs.controller';
import { IpldController } from './controllers/ipld.controller';
import { CoordinatorService } from './services/coordinator.service';
import { QueueService } from './services/queue.service';
import { RedisService } from './services/redis.service';
import { IpldService } from './services/ipld.service';
import { LitComputeGateway } from './gateways/lit-compute.gateway';

@Module({
  controllers: [NodesController, JobsController, IpldController],
  providers: [
    CoordinatorService,
    QueueService,
    RedisService,
    IpldService,
    LitComputeGateway,
  ],
  exports: [CoordinatorService, QueueService, RedisService, IpldService],
})
export class LitComputeModule {}
