import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { Response } from 'express';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IngestionExportDto } from '@libs/dtos/src/ingestion/ingestion-export.dto';
import { IngestionResponseDto } from '@libs/dtos/src/ingestion/ingestion-response.dto';

@ApiTags('Data Ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get('fetch/json')
  @Header('Content-Type', 'application/json')
  @Header('Content-Disposition', 'attachment; filename=air-quality-data.json')
  @ApiOperation({
    summary: 'Export air quality data as JSON',
    description:
      'Exports air quality measurements for a specified date range in JSON format. The data includes measurements of various air quality parameters (e.g., PM2.5, NO2, O3) from multiple locations.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description:
      'Start date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). OpenAQ API is really sensitive to this and might give 500s even if data is correct.',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description:
      'End date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ). OpenAQ API is really sensitive to this and might give 500s even if data is correct.',
    example: '2024-01-15T14:00:00Z',
  })
  @ApiResponse({
    status: 200,
    description: 'JSON file containing air quality data',
    type: [IngestionResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format or date range',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async exportJson(@Query() query: IngestionExportDto, @Res() res: Response) {
    const buffer = await this.ingestionService.exportToJson(
      query.startDate,
      query.endDate,
    );

    res.send(buffer);
  }

  @Get('fetch/excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename=air-quality-data.xlsx')
  @ApiOperation({
    summary: 'Export air quality data as Excel',
    description:
      'Exports air quality measurements for a specified date range in Excel format. The spreadsheet includes measurements of various air quality parameters (e.g., PM2.5, NO2, O3) from multiple locations.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    description: 'Start date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    description: 'End date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)',
    example: '2024-01-15T14:00:00Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Excel file containing air quality data',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format or date range',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async exportExcel(@Query() query: IngestionExportDto, @Res() res: Response) {
    const buffer = await this.ingestionService.exportToExcel(
      query.startDate,
      query.endDate,
    );

    res.send(buffer);
  }
}
