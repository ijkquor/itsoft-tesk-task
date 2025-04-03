import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQConfigService {
  constructor(private configService: ConfigService) {}

  get url(): string {
    return (
      this.configService.get<string>('RABBITMQ_URL') ||
      'amqp://guest:guest@localhost:5672'
    );
  }

  get exchange(): string {
    return this.configService.get<string>('RABBITMQ_EXCHANGE') || 'app_events';
  }

  get queue(): string {
    return this.configService.get<string>('RABBITMQ_QUEUE') || 'app_logs';
  }

  get routingKey(): string {
    return (
      this.configService.get<string>('RABBITMQ_ROUTING_KEY') ||
      'data.service.logs'
    );
  }

  get routingKeyPattern(): string {
    return (
      this.configService.get<string>('RABBITMQ_ROUTING_KEY') ||
      'data.service.logs.#'
    );
  }

  get useConfirmChannel(): boolean {
    const value = this.configService.get<string>(
      'RABBITMQ_USE_CONFIRM_CHANNEL',
    );
    return value ? (JSON.parse(value) as boolean) : true;
  }

  get maxReconnectAttempts(): number {
    const value = this.configService.get<string>(
      'RABBITMQ_MAX_RECONNECT_ATTEMPTS',
    );
    return value ? Number(value) : 10;
  }

  get reconnectDelayBase(): number {
    const value = this.configService.get<string>(
      'RABBITMQ_RECONNECT_DELAY_BASE',
    );
    return value ? Number(value) : 1000;
  }

  get prefetchCount(): number {
    const value = this.configService.get<string>('RABBITMQ_PREFETCH_COUNT');
    return value ? Number(value) : 10;
  }

  get enableDeadLetter(): boolean {
    const value = this.configService.get<string>('RABBITMQ_ENABLE_DEAD_LETTER');
    return value ? (JSON.parse(value) as boolean) : true;
  }
}
