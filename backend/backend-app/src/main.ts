import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });
  
  // Increase body size limit to handle large image uploads (10MB)
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
  
  // Get the absolute path to uploads directory (relative to backend-app folder)
  const uploadsPath = join(process.cwd(), 'uploads');
  
  // Serve static files from uploads directory
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    index: false,
  });
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'http://localhost:8080', // Vue.js dev server
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Static files served from: ${uploadsPath}`);
  console.log(`Current working directory: ${process.cwd()}`);
  
  // Debug: Log if uploads directory exists
  const fs = require('fs');
  if (fs.existsSync(uploadsPath)) {
    console.log(`Uploads directory exists: ${uploadsPath}`);
  } else {
    console.error(`Uploads directory NOT found: ${uploadsPath}`);
  }
}
bootstrap();
