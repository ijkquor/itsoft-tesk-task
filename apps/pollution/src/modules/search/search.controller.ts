import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchAirQualityDto, SearchResponseDto } from '@libs/dtos';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('air-quality')
  @ApiOperation({
    summary: 'Search air quality data with cursor-based pagination',
    description:
      'Searches for air quality measurements based on various criteria including location, parameter, value range, and date range. Results are paginated using cursor-based pagination. All fields are optional. Try to call query with the minimal amount of fields first and then add more fields to get more results.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of air quality measurements matching the search criteria',
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async search(
    @Query() query: SearchAirQualityDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.search(query);
  }
}
