import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoConfigService {
  constructor(private readonly configService: ConfigService) {}

  get pollutionUri(): string {
    const uri = this.configService.get<string>('MONGO_POLLUTION_URI');

    if (!uri) {
      throw new Error('MONGO_POLLUTION_URI is not defined');
    }

    return uri;
  }

  get loggerUri(): string {
    const uri = this.configService.get<string>('MONGO_LOGGER_URI');

    if (!uri) {
      throw new Error('MONGO_LOGGER_URI is not defined');
    }

    return uri;
  }

  get dbName(): string {
    const dbName = this.configService.get<string>('MONGO_DB_NAME');

    if (!dbName) {
      throw new Error('MONGO_DB_NAME is not defined');
    }

    return dbName;
  }

  get username(): string {
    const username = this.configService.get<string>('MONGO_USERNAME');

    if (!username) {
      throw new Error('MONGO_USERNAME is not defined');
    }

    return username;
  }

  get password(): string {
    const password = this.configService.get<string>('MONGO_PASSWORD');

    if (!password) {
      throw new Error('MONGO_PASSWORD is not defined');
    }

    return password;
  }
}
