import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/env';
import { AllExceptionsFilter } from './shared/http/domain-exception.filter';

// Configuracion comun para el servidor y para las pruebas de integracion.
export const configureApp = (app: INestApplication, config: AppConfig) => {
  app.setGlobalPrefix('api');
  // Cabeceras de seguridad basicas (sin dependencia adicional).
  app.getHttpAdapter().getInstance().disable?.('x-powered-by');
  app.use((_req: unknown, res: { setHeader: (name: string, value: string) => void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    if (config.nodeEnv === 'production') res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    next();
  });
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
