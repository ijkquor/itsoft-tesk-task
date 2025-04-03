import {
  EventSearchDto,
  EventSearchReportDto,
  EventSearchResponseDto,
} from '@libs/dtos';
import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { SearchService } from 'apps/logger/src/modules/search/search.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProduces,
} from '@nestjs/swagger';
import { Response } from 'express';
@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('events')
  @ApiOperation({
    summary: 'Search events based on criteria',
    description:
      'Searches for events based on various criteria including location, parameter, value range, and date range. Results are paginated using cursor-based pagination. All fields are optional. Try to call query with the minimal amount of fields first and then add more fields to get more results.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns filtered events based on search criteria',
    type: EventSearchResponseDto,
  })
  async search(
    @Query() query: EventSearchDto,
  ): Promise<EventSearchResponseDto> {
    return this.searchService.search(query);
  }

  @Get('report')
  @ApiOperation({
    summary: 'Generate PDF report of events based on search criteria',
    description:
      'Generates a PDF report of events based on search criteria. The report includes a list of events and their details. All fields are optional. Try to call query with the minimal amount of fields first and then add more fields to get more results.',
  })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=events.pdf')
  @ApiResponse({
    status: 200,
    description: 'Returns a PDF file containing the event report',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiProduces('application/pdf')
  async report(
    @Query() query: EventSearchReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.searchService.report(query);

    res.send(buffer);
  }
}
