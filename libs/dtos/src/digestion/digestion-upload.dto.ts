import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IsDateString } from 'class-validator';
import { IngestionResponseDto } from '../ingestion/ingestion-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DigestionUploadDto implements IngestionResponseDto {
  @ApiProperty({
    description: 'Timestamp of the measurement in UTC',
    example: '2024-01-15T14:30:00Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  datetime: string;

  @ApiProperty({
    description: 'Latitude coordinate of the measurement location',
    example: 52.52,
    required: true,
  })
  @IsLatitude()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate of the measurement location',
    example: 13.405,
    required: true,
  })
  @IsLongitude()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'Name of the measurement location',
    example: 'Berlin Central Station',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Name of the measured parameter (e.g., PM2.5, NO2, O3)',
    example: 'PM2.5',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  parameter: string;

  @ApiProperty({
    description: 'Measured value of the parameter',
    example: 12.5,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;
}
