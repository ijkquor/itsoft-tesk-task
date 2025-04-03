import { Test, TestingModule } from '@nestjs/testing';
import { DigestionController } from './digestion.controller';

describe('DigestionController', () => {
  let controller: DigestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigestionController],
    }).compile();

    controller = module.get<DigestionController>(DigestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
