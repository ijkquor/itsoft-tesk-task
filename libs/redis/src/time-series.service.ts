import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@libs/redis';
import { EventPayload } from '@libs/dtos';

@Injectable()
export class TimeSeriesService {
  private readonly logger = new Logger(TimeSeriesService.name);

  constructor(private readonly redisService: RedisService) {}

  async createTimeSeries(
    key: string,
    labels: Record<string, string> = {},
    retentionTime?: number,
  ): Promise<void> {
    const client = this.redisService.getClient();

    if (!client) {
      this.logger.error(
        `Cannot create time series ${key}: Redis client is not initialized`,
      );
      return;
    }

    const labelArgs = Object.entries(labels).flatMap(([name, value]) => [
      'LABELS',
      name,
      value,
    ]);
    const retentionArgs = retentionTime
      ? ['RETENTION', retentionTime.toString()]
      : [];

    try {
      await client.sendCommand([
        'TS.CREATE',
        key,
        ...retentionArgs,
        ...labelArgs,
      ]);

      this.logger.log(`Created time series: ${key}`);
    } catch (_error) {
      const error = _error as Error;

      if (!error.message.includes('already exists')) {
        this.logger.error(
          `Error creating time series ${key}: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }
  }

  async addEventToTimeSeries(key: string, value: EventPayload): Promise<void> {
    const client = this.redisService.getClient();

    if (!client) {
      this.logger.error(
        `Cannot add event to time series ${key}: Redis client is not initialized`,
      );
      return;
    }

    await client.sendCommand(['TS.ADD', key, JSON.stringify(value)]);
  }
}
