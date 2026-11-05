import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/env';
import { AllExceptionsFilter } from './shared/http/domain-exception.filter';

// Configuracion comun para el servidor y para las pruebas de integracion.
export const configureApp = (app: INestApplication, config: AppConfig) => {
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.corsOrigins, credentials: false });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Edu Sudamericano CACES API')
      .setDescription('Evidencias, verificaciones presenciales y valoraciones del Modelo CACES 2024 para ISTT')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, document);
  return app;
};
