import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { LitComputeModule } from './lit-compute/lit-compute.module';
import { NPEModule } from './npe/npe.module';
import { XrModule } from './xr/xr.module';

@Module({
  imports: [EventsModule, LitComputeModule, NPEModule, XrModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
