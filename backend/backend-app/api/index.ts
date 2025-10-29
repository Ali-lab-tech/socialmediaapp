// Vercel Serverless Function Entry Point
// This file allows NestJS to run as a Vercel serverless function

import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';

let cachedApp: any;

async function createApp() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter);

  // Increase body size limit
  expressApp.use(express.json({ limit: '50mb' }));
  expressApp.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for now
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: express.Request, res: express.Response) {
  const app = await createApp();
  return app(req, res);
}

