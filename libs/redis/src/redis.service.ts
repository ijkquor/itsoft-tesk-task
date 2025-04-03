import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(
    private readonly host: string,
    private readonly port: number,
  ) {}

  async connect() {
    this.logger.log('Connecting to Redis...');

    this.client = createClient({
      url: `redis://${this.host}:${this.port}`,
      database: 0,
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack);
    });

    this.client.on('reconnecting', () => {
      this.logger.log('Reconnecting to Redis...');
    });

    await this.client.connect();
    this.logger.log('Successfully connected to Redis');
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, { EX: ttl });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async setJson(key: string, value: any, ttl?: number): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await this.set(key, jsonValue, ttl);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  }
}
