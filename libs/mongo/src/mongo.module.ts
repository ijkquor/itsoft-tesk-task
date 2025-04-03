// mongo.module.ts
import {
  Module,
  DynamicModule,
  Provider,
  Type,
  Global,
  Logger,
} from '@nestjs/common';
import { MongoService } from './mongo.service';
import { AirQualityRepository } from './repositories/air-quality.repository';
import { BaseRepository } from './repositories/base.repository';

interface MongoOptions {
  uri: string;
  dbName: string;
  username: string;
  password: string;
}

interface MongoAsyncOptions {
  imports?: Type<any>[];
  inject?: any[];
  useFactory: (...args: any[]) => Promise<MongoOptions> | MongoOptions;
  repositories?: Type<BaseRepository<any>>[];
}

@Global()
@Module({})
export class MongoModule {
  static forRootAsync(options: MongoAsyncOptions): DynamicModule {
    const logger = new Logger(MongoModule.name);

    const mongoServiceProvider: Provider = {
      provide: MongoService,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        const mongoService = new MongoService(
          config.uri,
          config.dbName,
          config.username,
          config.password,
        );

        await mongoService.connect();

        return mongoService;
      },
      inject: options.inject || [],
    };

    const repositoryProviders: Provider[] = [];

    for (const repository of options.repositories || []) {
      repositoryProviders.push({
        provide: repository,
        useFactory: async (mongoService: MongoService) => {
          const instance = new repository(mongoService);

          logger.log(`Synchronizing ${repository.name}...`);

          await instance.synchronization(mongoService);

          logger.log(`${repository.name} synchronized.`);

          return instance;
        },
        inject: [MongoService],
      });
    }

    return {
      module: MongoModule,
      imports: [...(options.imports || [])],
      providers: [mongoServiceProvider, ...repositoryProviders],
      exports: [MongoService, ...repositoryProviders],
    };
  }
}
