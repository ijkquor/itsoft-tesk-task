// mongo.service.ts
import {
  Injectable,
  Logger,
  LoggerService,
  OnApplicationShutdown,
} from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { MongoClient, Db, Collection, Document } from 'mongodb';

@Injectable()
export class MongoService implements OnApplicationShutdown {
  private client: MongoClient;
  private db: Db;
  private logger: LoggerService = new Logger(MongoService.name);

  constructor(
    private readonly uri: string,
    private readonly dbName: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async connect(): Promise<void> {
    this.logger.log('Trying to connect to MongoDB...');

    this.client = new MongoClient(this.uri, {
      auth: {
        username: this.username,
        password: this.password,
      },
      authSource: 'admin',
      authMechanism: 'SCRAM-SHA-256',
    });

    await this.client.connect();

    this.db = this.client.db(this.dbName);

    this.logger.log('Connected to MongoDB.');
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.');
    }

    return this.db;
  }

  getCollection<T extends Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }

  async onApplicationShutdown() {
    if (this.client) {
      await this.client.close();

      console.log('MongoDB connection closed');
    }
  }

  static async ping(uris: string[]): Promise<HealthIndicatorResult> {
    try {
      const clients = uris.map((uri) => new MongoClient(uri));

      await Promise.all(
        clients.map((client) => client.db().command({ ping: 1 })),
      );

      return { [`mongo`]: { status: 'up' } };
    } catch (_error) {
      const error = _error as Error;

      return { mongo: { status: 'down', message: error.message } };
    }
  }
}
