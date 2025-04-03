import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

interface RabbitMQModuleOptions {
  url: string;
  exchange: string;
  queue: string;
  routingKey: string;
  maxReconnectAttempts: number;
  reconnectDelayBase: number;
  prefetchCount: number;
  useConfirmChannel: boolean;
  enableDeadLetter: boolean;
}

interface RabbitMQAsyncOptions {
  imports?: Type<any>[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
}

@Global()
@Module({})
export class RabbitMQModule {
  static forRootAsync(options: RabbitMQAsyncOptions): DynamicModule {
    const rabbitMqServiceProvider: Provider = {
      provide: RabbitMQService,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        const rabbitMQService = new RabbitMQService(
          config.url,
          config.exchange,
          config.queue,
          config.routingKey,
          config.maxReconnectAttempts,
          config.reconnectDelayBase,
          config.prefetchCount,
          config.enableDeadLetter,
          config.useConfirmChannel,
        );

        await rabbitMQService.connect();

        return rabbitMQService;
      },
      inject: options.inject || [],
    };

    return {
      module: RabbitMQModule,
      imports: [...(options.imports || [])],
      providers: [rabbitMqServiceProvider],
      exports: [rabbitMqServiceProvider],
    };
  }
}
