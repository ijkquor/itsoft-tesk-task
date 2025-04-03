import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo.service';
import { BaseRepository } from './base.repository';
import { EventModel } from '@libs/mongo/src/models/event.model';

export const EVENT_COLLECTION = 'event';

@Injectable()
export class EventRepository extends BaseRepository<EventModel> {
  constructor(mongoService: MongoService) {
    super(mongoService, EVENT_COLLECTION);
  }

  async synchronization(mongoService: MongoService): Promise<void> {
    const collection = mongoService.getCollection<EventModel>(EVENT_COLLECTION);

    await collection.createIndex({ createdAt: 1 });
    await collection.createIndex({ endpoint: 1 });
    await collection.createIndex({ method: 1 });
    await collection.createIndex({ path: 1 });
    await collection.createIndex({ ip: 1 });
    await collection.createIndex({ statusCode: 1 });

    await collection.createIndex({ method: 1, path: 1, createdAt: -1 });
    await collection.createIndex({ endpoint: 1, method: 1, statusCode: 1 });
    await collection.createIndex({ ip: 1, createdAt: -1 });
    await collection.createIndex({ path: 1, statusCode: 1, createdAt: -1 });
    await collection.createIndex({ method: 1, statusCode: 1, responseTime: 1 });
  }
}
