import { EventPayloadDto } from '@libs/dtos';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel | amqp.ConfirmChannel;
  private reconnectAttempts = 0;
  private isConnected = false;
  private isConfirmChannel = false;

  constructor(
    private readonly url: string,
    private readonly exchange: string,
    private readonly queue: string,
    private readonly routingKey: string,
    private readonly maxReconnectAttempts: number,
    private readonly reconnectDelayBase: number,
    private readonly prefetchCount: number,
    private readonly enableDeadLetter: boolean,
    private readonly useConfirmChannel: boolean,
  ) {}

  async onModuleDestroy() {
    try {
      await this.close();
    } catch (_error) {
      const error = _error as Error;

      this.logger.error(
        `Error during RabbitMQ shutdown: ${error.message}`,
        error.stack,
      );
    }
  }

  async connect() {
    try {
      this.logger.log(`Connecting to RabbitMQ at ${this.url}`);
      this.connection = await amqp.connect(this.url);

      this.connection.on('error', (error: Error) => {
        this.logger.error(
          `RabbitMQ connection error: ${error.message}`,
          error.stack,
        );

        this.isConnected = false;

        this.reconnect();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');

        this.isConnected = false;

        this.reconnect();
      });

      try {
        if (this.useConfirmChannel) {
          this.channel = await this.connection.createConfirmChannel();

          this.isConfirmChannel = true;

          this.logger.log('Created confirm channel for publisher confirms');
        } else {
          this.channel = await this.connection.createChannel();

          this.isConfirmChannel = false;

          this.logger.log(
            'Created regular channel (publisher confirms disabled)',
          );
        }
      } catch (_error) {
        const error = _error as Error;

        this.logger.warn(
          `Failed to create ${this.useConfirmChannel ? 'confirm' : 'regular'} channel: ${error.message}. Falling back to regular channel.`,
        );
        this.channel = await this.connection.createChannel();

        this.isConfirmChannel = false;
      }

      this.channel.on('error', (error: Error) => {
        this.logger.error(
          `RabbitMQ channel error: ${error.message}`,
          error.stack,
        );
      });

      await this.setupExchangeAndQueue();

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log('Connected to RabbitMQ successfully');
    } catch (_error) {
      const error = _error as Error;

      this.logger.error(
        `Failed to connect to RabbitMQ: ${error.message}`,
        error.stack,
      );
      this.isConnected = false;
      this.reconnect();
    }
  }

  private async setupExchangeAndQueue() {
    if (!this.channel) {
      throw new Error('Channel not available');
    }

    try {
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
        autoDelete: false,
      });

      const queueOptions: amqp.Options.AssertQueue = {
        durable: true,
        autoDelete: false,
      };

      if (this.enableDeadLetter) {
        queueOptions.arguments = {
          'x-dead-letter-exchange': `${this.exchange}.dlx`,
          'x-dead-letter-routing-key': `${this.routingKey}.dead`,
        };

        await this.channel.assertExchange(`${this.exchange}.dlx`, 'topic', {
          durable: true,
          autoDelete: false,
        });

        await this.channel.assertQueue(`${this.queue}.dead`, {
          durable: true,
          autoDelete: false,
        });

        await this.channel.bindQueue(
          `${this.queue}.dead`,
          `${this.exchange}.dlx`,
          `${this.routingKey}.dead`,
        );
      }

      await this.channel.assertQueue(this.queue, queueOptions);

      await this.channel.bindQueue(this.queue, this.exchange, this.routingKey);

      await this.channel.prefetch(this.prefetchCount);

      this.logger.log(
        `Exchange ${this.exchange} and queue ${this.queue} set up successfully`,
      );
    } catch (_error) {
      const error = _error as Error;

      this.logger.error(
        `Failed to set up exchange and queue: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(
        `Failed to reconnect to RabbitMQ after ${this.maxReconnectAttempts} attempts`,
      );
      return;
    }

    const delay = Math.min(
      this.reconnectDelayBase * Math.pow(2, this.reconnectAttempts),
      30000,
    );
    this.reconnectAttempts++;

    this.logger.log(
      `Attempting to reconnect to RabbitMQ in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );

    setTimeout(() => {
      // Wrap connect in try-catch to prevent unhandled promise rejections
      this.connect().catch((error: Error) => {
        this.logger.error(
          `Error during reconnect attempt: ${error.message}`,
          error.stack,
        );
        // Continue reconnection attempts despite errors
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      });
    }, delay);
  }

  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Disconnected from RabbitMQ');
    } catch (_error) {
      const error = _error as Error;

      this.logger.error(
        `Error closing RabbitMQ connection: ${error.message}`,
        error.stack,
      );
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private generateCorrelationId(): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `cid${timestamp}-${randomStr}`;
  }

  async publishEvent(payload: EventPayloadDto): Promise<boolean> {
    try {
      const toValidate = plainToClass(EventPayloadDto, payload);

      await validateOrReject(toValidate);
    } catch (validationErrors) {
      this.logger.error(
        `Event validation failed: ${JSON.stringify(validationErrors)}`,
      );
      return false;
    }

    if (!this.isConnected || !this.channel) {
      this.logger.warn('Cannot publish event: Not connected to RabbitMQ');
      return false;
    }

    const specificRoutingKey = this.routingKey;

    try {
      const corellationId =
        payload.correlationId || this.generateCorrelationId();

      const messageId = this.generateMessageId();

      const messageContentString = JSON.stringify(payload);

      this.logger.debug(
        `Event content before publishing: ${messageContentString.slice(0, 100) + '...'}`,
      );

      const messageContentBuffer = Buffer.from(messageContentString);

      const result = this.channel.publish(
        this.exchange,
        specificRoutingKey,
        messageContentBuffer,
        {
          persistent: true,
          contentType: 'application/json',
          contentEncoding: 'utf-8',
          messageId: messageId,
          correlationId: corellationId,
          timestamp: Date.now(),
          headers: {
            'x-service': 'data-service-a',
          },
        },
      );

      if (!result) {
        this.logger.warn(
          `Failed to publish message (buffer full) to ${this.exchange}`,
        );
        return false;
      }

      if (this.isConfirmChannel) {
        try {
          await new Promise<void>((resolve, reject) => {
            const confirmChannel = this.channel as amqp.ConfirmChannel;
            confirmChannel
              .waitForConfirms()
              .then(() => resolve())
              .catch((error: Error) => reject(error));
          });
          this.logger.log(
            `Message confirmed by broker: ${this.exchange} with routing key ${specificRoutingKey}`,
          );
        } catch (_error) {
          const error = _error as Error;

          this.logger.error(`Message rejected by broker: ${error.message}`);
          return false;
        }
      } else {
        this.logger.log(
          `Published message to ${this.exchange} with routing key ${specificRoutingKey} (no confirmation)`,
        );
      }

      return true;
    } catch (_error) {
      const error = _error as Error;

      this.logger.error(
        `Error publishing message: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  getChannel() {
    return this.channel;
  }

  getQueue() {
    return this.queue;
  }

  getExchange() {
    return this.exchange;
  }
}
