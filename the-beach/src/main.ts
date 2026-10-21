import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for XR development
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve static files for Babylon.js XR frontend
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT ?? 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 XR Server running on: http://localhost:${port}`);
}
bootstrap();
