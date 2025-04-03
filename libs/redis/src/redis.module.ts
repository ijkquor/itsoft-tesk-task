import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { RedisService } from './redis.service';
import { TimeSeriesService } from './time-series.service';

interface RedisModuleOptions {
  host: string;
  port: number;
}

interface RedisAsyncOptions {
  imports?: Type<any>[];
  inject?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
}

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(options: RedisAsyncOptions): DynamicModule {
    const redisServiceProvider: Provider = {
      provide: RedisService,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        const redisService = new RedisService(config.host, config.port);

        await redisService.connect();

        return redisService;
      },
      inject: options.inject || [],
    };

    const timeSeriesServiceProvider: Provider = {
      provide: TimeSeriesService,
      useFactory: (redisService: RedisService) => {
        return new TimeSeriesService(redisService);
      },
      inject: [RedisService],
    };

    return {
      module: RedisModule,
      imports: [...(options.imports || [])],
      providers: [redisServiceProvider, timeSeriesServiceProvider],
      exports: [redisServiceProvider, timeSeriesServiceProvider],
    };
  }
}
