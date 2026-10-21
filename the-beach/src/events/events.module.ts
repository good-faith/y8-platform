import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway], // Provide the gateway
})
export class EventsModule {}
