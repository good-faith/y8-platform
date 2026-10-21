import { Module } from '@nestjs/common';
import { XrController } from './xr.controller';

@Module({
  controllers: [XrController],
  exports: [],
})
export class XrModule {}
