import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, IsString } from 'class-validator';

export class BaseSearchDto {
  @ApiPropertyOptional({
    description:
      'Cursor for pagination. Use the value returned in the previous response to get the next page of results.',
    example: 'eyJpZCI6IjY0ZjI5YjY5ZTI5ZjY5ZTI5ZjY5ZTI5ZjY5In0=',
  })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of records to return per page',
    default: 10,
    minimum: 1,
    maximum: 100,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601 format)',
    example: '2024-01-15T14:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
