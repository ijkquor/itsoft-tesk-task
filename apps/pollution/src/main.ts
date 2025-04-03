import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as compression from 'compression';
import { AppModule } from './modules/app/app.module';
import { AppConfigService } from '@libs/app-config';
import { SpyingMiddleware } from '@libs/middlewares';
import { RabbitMQService } from '@libs/rabbitmq';
import { TimeSeriesService } from '@libs/redis';

async function bootstrap() {
  const nativeLogger = new Logger('Application');

  const app = await NestFactory.create(AppModule, {
    logger: nativeLogger,
    rawBody: false,
  });

  const appConfigService = app.get(AppConfigService);
  const port = appConfigService.pollutionPort;

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

  const rabbitMqService = app.get(RabbitMQService);
  const timeSeriesService = app.get(TimeSeriesService);

  const spyingMiddleware = new SpyingMiddleware(
    rabbitMqService,
    'pollution',
    timeSeriesService,
  );

  const routesToSpyOn = ['/search', '/ingestion', '/digestion'];

  routesToSpyOn.forEach((route) => {
    app.use(route, spyingMiddleware.use.bind(spyingMiddleware));
  });

  AppModule.setupSwagger(app);
  AppModule.setupGlobalFilters(app);
  await app.listen(port);

  nativeLogger.log(
    `Application server is listening on: http://localhost:${port}`,
  );
}

bootstrap();
