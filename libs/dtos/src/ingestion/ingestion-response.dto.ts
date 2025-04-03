import { ApiProperty } from '@nestjs/swagger';

export class IngestionResponseDto {
  @ApiProperty({
    description: 'Timestamp of the measurement in UTC',
    example: '2024-01-15T14:30:00Z',
  })
  datetime!: string;

  @ApiProperty({
    description: 'Name of the measured parameter (e.g., PM2.5, NO2, O3)',
    example: 'PM2.5',
  })
  parameter!: string;

  @ApiProperty({
    description: 'Measured value of the parameter',
    example: 12.5,
  })
  value!: number;

  @ApiProperty({
    description: 'Longitude coordinate of the measurement location',
    example: 13.405,
  })
  longitude!: number;

  @ApiProperty({
    description: 'Latitude coordinate of the measurement location',
    example: 52.52,
  })
  latitude!: number;

  @ApiProperty({
    description: 'Name of the measurement location',
    example: 'Berlin Central Station',
  })
  location!: string;
}
