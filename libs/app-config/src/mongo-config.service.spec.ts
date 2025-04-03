import { Test, TestingModule } from '@nestjs/testing';
import { MongoConfigService } from './mongo-config.service';

describe('MongoConfigService', () => {
  let service: MongoConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MongoConfigService],
    }).compile();

    service = module.get<MongoConfigService>(MongoConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
