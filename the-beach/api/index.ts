import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import AppModule from source for development
// For production Vercel deployment, this will be built to dist
import { AppModule } from '../src/app.module';

let app: NestExpressApplication | null = null;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS for XR development
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Serve static files for Babylon.js XR frontend
    // In Vercel's serverless environment, public folder is accessible at the project root
    const publicPath = join(process.cwd(), 'public');
    app.useStaticAssets(publicPath);

    await app.init();
  }
  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const server = await bootstrap();
  return server.getHttpAdapter().getInstance()(req, res);
}
