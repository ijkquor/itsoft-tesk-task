import { EventPayload, EventPayloadDto } from '@libs/dtos';
import { RabbitMQService } from '@libs/rabbitmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventRepository } from '@libs/mongo';
@Injectable()
export class IngestionService implements OnModuleInit {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly eventRepository: EventRepository,
  ) {}

  async onModuleInit() {
    this.logger.debug('Listening to events...');

    await this.rabbitMQService
      .getChannel()
      .consume(this.rabbitMQService.getQueue(), async (message) => {
        if (message) {
          this.logger.debug(
            `Got message!: ${message.content.toString().slice(0, 100) + '...'}`,
          );

          const event = JSON.parse(
            message.content.toString(),
          ) as EventPayloadDto;

          const payload = event.payload as EventPayload;

          try {
            await this.eventRepository.create({
              ...payload,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            this.rabbitMQService.getChannel().ack(message);

            this.logger.debug('Event created successfully');
          } catch (error) {
            this.logger.error(error);
          }
        }
      });
  }
}
