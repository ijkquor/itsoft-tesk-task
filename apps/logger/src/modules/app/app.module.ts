import {
  AppConfigModule,
  MongoConfigService,
  RabbitMQConfigService,
  ThrottlerConfigService,
} from '@libs/app-config';
import { GlobalExceptionFilter } from '@libs/exception-filters';
import { MongoModule, EventRepository } from '@libs/mongo';
import { RabbitMQModule } from '@libs/rabbitmq';
import { INestApplication, Module } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ThrottlerModule } from '@nestjs/throttler';
import { IngestionModule } from '../ingestion/ingestion.module';
import { SearchModule } from 'apps/logger/src/modules/search/search.module';

@Module({
  imports: [
    AppConfigModule,

    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [ThrottlerConfigService],
      useFactory: (throttlerConfigService: ThrottlerConfigService) => ({
        throttlers: [
          {
            ttl: throttlerConfigService.ttl,
            limit: throttlerConfigService.limit,
          },
        ],
      }),
    }),

    MongoModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [MongoConfigService],
      useFactory: (mongoConfigService: MongoConfigService) => ({
        uri: mongoConfigService.pollutionUri,
        dbName: mongoConfigService.dbName,
        username: mongoConfigService.username,
        password: mongoConfigService.password,
      }),
      repositories: [EventRepository],
    }),

    RabbitMQModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [RabbitMQConfigService],
      useFactory: (rabbitMQConfigService: RabbitMQConfigService) => ({
        url: rabbitMQConfigService.url,
        exchange: rabbitMQConfigService.exchange,
        queue: rabbitMQConfigService.queue,
        routingKey: rabbitMQConfigService.routingKey,
        maxReconnectAttempts: rabbitMQConfigService.maxReconnectAttempts,
        reconnectDelayBase: rabbitMQConfigService.reconnectDelayBase,
        prefetchCount: rabbitMQConfigService.prefetchCount,
        useConfirmChannel: rabbitMQConfigService.useConfirmChannel,
        enableDeadLetter: rabbitMQConfigService.enableDeadLetter,
      }),
    }),

    IngestionModule,
    SearchModule,
  ],
  providers: [],
})
export class AppModule {
  static setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Logger API')
      .setDescription('The Logger API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  static setupGlobalFilters(app: INestApplication) {
    app.useGlobalFilters(new GlobalExceptionFilter());
  }
}
