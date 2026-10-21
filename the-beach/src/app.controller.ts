import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getStatus() {
    return {
      message: 'Babylon.js XR Server is running!',
      endpoints: {
        '/': 'Server status',
        '/xr': 'XR Environment',
        '/xr/info': 'XR Information',
        '/public/*': 'Static XR assets',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
