import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 300000, // 5 minute timeout for large datasets
    }),
  ],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}
