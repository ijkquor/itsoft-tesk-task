import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppConfigService } from '@libs/app-config';
import { AppModule } from './modules/app/app.module';

async function bootstrap() {
  const nativeLogger = new Logger('Application');

  const app = await NestFactory.create(AppModule, {
    logger: nativeLogger,
    rawBody: false,
  });

  const appConfigService = app.get(AppConfigService);
  const port = appConfigService.loggerPort;

  app.enableCors();

  app.use(
    compression({
      level: 6,
      threshold: 0,
      memLevel: 8,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  );

  AppModule.setupSwagger(app);
  AppModule.setupGlobalFilters(app);
  nativeLogger.log(
    `Application server is listening on: http://localhost:${port}`,
  );

  app.listen(port);
}

bootstrap();
