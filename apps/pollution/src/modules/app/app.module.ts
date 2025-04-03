import { INestApplication, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AppConfigModule,
  MongoConfigService,
  RedisConfigService,
  ThrottlerConfigService,
} from '@libs/app-config';
import { AirQualityRepository, MongoModule } from '@libs/mongo';
import { RedisModule } from '@libs/redis';
import { RabbitMQModule } from '@libs/rabbitmq';
import { RabbitMQConfigService } from '@libs/app-config';
import { IngestionModule } from '../ingestion/ingestion.module';
import { DigestionModule } from '../digestion/digestion.module';
import { SearchModule } from '../search/search.module';
import { GlobalExceptionFilter } from '@libs/exception-filters';

export const EMITTER_NAME = 'EMITTER_NAME';

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
      repositories: [AirQualityRepository],
    }),

    RedisModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [RedisConfigService],
      useFactory: (redisConfigService: RedisConfigService) => ({
        host: redisConfigService.host,
        port: redisConfigService.port,
      }),
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
    DigestionModule,
    SearchModule,
  ],
  providers: [],
})
export class AppModule {
  static setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('Pollution API')
      .setDescription('The Pollution API description')
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
