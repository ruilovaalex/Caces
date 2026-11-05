import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config as loadDotenv } from 'dotenv';
import { AppModule } from './app.module';
import { configureApp } from './bootstrap';
import { loadConfig } from './config/env';

async function main() {
  loadDotenv();
  const config = loadConfig();
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });
  configureApp(app, config);
  app.enableShutdownHooks();
  await app.listen(config.port);
  Logger.log(`API en http://localhost:${config.port}/api · documentacion en /api/docs`, 'Bootstrap');
}

void main();
