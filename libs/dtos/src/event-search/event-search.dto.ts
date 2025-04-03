import { BaseSearchDto } from '@libs/dtos/src/base/base-search.dto';
import { IEventPayload } from '@libs/dtos';
import { IsDateString, IsNumber, IsString } from 'class-validator';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class EventSearchCommonDto {
  @ApiPropertyOptional({
    description: 'IP address of the event',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Path of the event',
    example: '/api/v1/events',
  })
  @IsOptional()
  @IsString()
  path?: string | undefined;

  @ApiPropertyOptional({
    description: 'Method of the event',
    example: 'GET',
  })
  @IsOptional()
  @IsString()
  method?: string | undefined;

  @ApiPropertyOptional({
    description: 'Status code of the event',
    example: 200,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'Minimum execution time of the event',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  minExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Maximum execution time of the event',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  maxExecutionTime?: number;
}

export class EventSearchDto
  extends BaseSearchDto
  implements Partial<IEventPayload>, EventSearchCommonDto
{
  @ApiPropertyOptional({
    description: 'IP address of the event',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Path of the event',
    example: '/api/v1/events',
  })
  @IsOptional()
  @IsString()
  path?: string | undefined;

  @ApiPropertyOptional({
    description: 'Method of the event',
    example: 'GET',
  })
  @IsOptional()
  @IsString()
  method?: string | undefined;

  @ApiPropertyOptional({
    description: 'Status code of the event',
    example: 200,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  statusCode?: number;

  @ApiPropertyOptional({
    description: 'Minimum execution time of the event',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  minExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Maximum execution time of the event',
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  maxExecutionTime?: number;
}

export class EventSearchReportDto extends EventSearchCommonDto {
  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering air (ISO 8601 format)',
    example: '2024-01-15T14:00:00Z',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
