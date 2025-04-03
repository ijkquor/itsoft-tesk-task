import { Module } from '@nestjs/common';
import { DigestionService } from './digestion.service';
import { DigestionController } from './digestion.controller';

@Module({
  providers: [DigestionService],
  controllers: [DigestionController],
  exports: [DigestionService],
})
export class DigestionModule {}
