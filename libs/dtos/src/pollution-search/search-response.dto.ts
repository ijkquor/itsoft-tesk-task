import { BaseResponseDto } from '@libs/dtos/src/base/base-response.dto';
import { AirQualityModel } from '@libs/mongo';
import { ApiProperty } from '@nestjs/swagger';

export class SearchResponseDto extends BaseResponseDto<AirQualityModel> {
  @ApiProperty({
    description:
      'Array of air quality measurements matching the search criteria',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        datetime: { type: 'string', example: '2024-01-15T14:30:00Z' },
        parameter: { type: 'string', example: 'PM2.5' },
        value: { type: 'number', example: 12.5 },
        location: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Berlin Central Station' },
            coordinates: {
              type: 'object',
              properties: {
                latitude: { type: 'number', example: 52.52 },
                longitude: { type: 'number', example: 13.405 },
              },
            },
          },
        },
      },
    },
  })
  declare items: AirQualityModel[];

  @ApiProperty({
    description: 'Cursor for the next page of results',
    example: 'MjAyNC0wMS0xNVQxNDozMDowMFo6NTA3ZjFmNzdiY2Y4NmNkNzk5NDM5MDEx',
    required: false,
  })
  declare nextCursor?: string;

  @ApiProperty({
    description: 'Indicates if there are more results available',
    example: true,
  })
  declare hasMore: boolean;
}
