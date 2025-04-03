import { Test, TestingModule } from '@nestjs/testing';
import { DigestionService } from './digestion.service';

describe('DigestionService', () => {
  let service: DigestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigestionService],
    }).compile();

    service = module.get<DigestionService>(DigestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
