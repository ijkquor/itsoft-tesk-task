import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IngestionExportDto {
  @ApiProperty({
    description:
      'Start date for data export in ISO 8601 format (YYYY-MM-DD HH:mm:ss)',
    example: '2024-01-01 00:00:00',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description:
      'End date for data export in ISO 8601 format (YYYY-MM-DD HH:mm:ss)',
    example: '2024-01-31 23:59:59',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
