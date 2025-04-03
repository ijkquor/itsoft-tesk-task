import {
  IsOptional,
  IsString,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseSearchDto } from '@libs/dtos/src/base/base-search.dto';
import { Transform } from 'class-transformer';

export class SearchAirQualityDto extends BaseSearchDto {
  @ApiPropertyOptional({
    description: 'Latitude coordinate for location-based filtering',
    example: 48.8566,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsLatitude()
  @Transform(({ value }) => Number(value))
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate for location-based filtering',
    example: 2.3522,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsLongitude()
  @Transform(({ value }) => Number(value))
  longitude?: number;

  @ApiPropertyOptional({
    description:
      'Air quality parameter to filter by (e.g., PM2.5, PM10, O3, NO2)',
    example: 'PM2.5',
  })
  @IsOptional()
  @IsString()
  parameter?: string;

  @ApiPropertyOptional({
    description: 'Minimum value threshold for the air quality parameter',
    example: 10,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  minValue?: number;

  @ApiPropertyOptional({
    description: 'Maximum value threshold for the air quality parameter',
    example: 50,
    type: 'number',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  maxValue?: number;
}
