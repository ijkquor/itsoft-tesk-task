import { Injectable } from '@nestjs/common';
import { MongoService } from '../mongo.service';
import { BaseRepository } from './base.repository';
import { AirQualityModel } from '../models/air-quality.model';

export const AIR_QUALITY_COLLECTION = 'air_quality';

@Injectable()
export class AirQualityRepository extends BaseRepository<AirQualityModel> {
  constructor(mongoService: MongoService) {
    super(mongoService, AIR_QUALITY_COLLECTION);
  }

  async synchronization(mongoService: MongoService): Promise<void> {
    const collection = mongoService.getCollection<AirQualityModel>(
      AIR_QUALITY_COLLECTION,
    );

    await collection.createIndex({ datetime: 1 });
    await collection.createIndex({ parameter: 1 });
    await collection.createIndex({ parameter: 1, value: 1 });
    await collection.createIndex({ location: 1 });
    await collection.createIndex({ longitude: 1, latitude: 1 });
  }
}
