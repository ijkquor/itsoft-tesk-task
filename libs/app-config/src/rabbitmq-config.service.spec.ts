import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMQConfigService } from './rabbitmq-config.service';

describe('RabbitMQConfigService', () => {
  let service: RabbitMQConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RabbitMQConfigService],
    }).compile();

    service = module.get<RabbitMQConfigService>(RabbitMQConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
