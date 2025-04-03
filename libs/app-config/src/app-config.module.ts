import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './app-config.service';
import { ConfigModule } from '@nestjs/config';
import { MongoConfigService } from './mongo-config.service';
import { RedisConfigService } from './redis-config.service';
import { ThrottlerConfigService } from './throttler-config.service';
import { RabbitMQConfigService } from './rabbitmq-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [
    AppConfigService,
    MongoConfigService,
    RedisConfigService,
    ThrottlerConfigService,
    RabbitMQConfigService,
  ],
  exports: [
    AppConfigService,
    MongoConfigService,
    RedisConfigService,
    ThrottlerConfigService,
    RabbitMQConfigService,
  ],
})
export class AppConfigModule {}
