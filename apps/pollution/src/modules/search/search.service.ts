import { Injectable } from '@nestjs/common';
import { AirQualityRepository } from '@libs/mongo';
import { SearchAirQualityDto, SearchResponseDto } from '@libs/dtos';
import { Filter } from 'mongodb';
import { AirQualityModel } from '@libs/mongo';

@Injectable()
export class SearchService {
  constructor(private readonly airQualityRepository: AirQualityRepository) {}

  async search({
    cursor,
    limit,
    startDate,
    endDate,
    latitude,
    longitude,
    parameter,
    minValue,
    maxValue,
  }: SearchAirQualityDto): Promise<SearchResponseDto> {
    const filter: Filter<AirQualityModel> = {};

    if (startDate || endDate) {
      filter.datetime = {};
      if (startDate) filter.datetime.$gte = startDate;
      if (endDate) filter.datetime.$lte = endDate;
    }

    if (latitude && longitude) {
      filter['location.latitude'] = latitude;
      filter['location.longitude'] = longitude;
    }

    if (parameter) {
      filter.parameter = parameter;
    }

    if (minValue !== undefined || maxValue !== undefined) {
      filter.value = {};
      if (minValue !== undefined) filter.value.$gte = minValue;
      if (maxValue !== undefined) filter.value.$lte = maxValue;
    }

    if (cursor) {
      const decodedCursor = Buffer.from(cursor, 'base64').toString('ascii');
      const [timestamp, id] = decodedCursor.split(':');
      filter.$or = [
        { datetime: { $lt: timestamp } },
        { datetime: timestamp, _id: { $lt: id } },
      ];
    }

    const results = await this.airQualityRepository
      .getCollection()
      .find(filter)
      .sort({ datetime: -1, _id: -1 })
      .limit(limit + 1)
      .toArray();

    const hasMore = results.length > limit;
    const items = results.slice(0, limit);

    let nextCursor: string | undefined;

    if (hasMore) {
      const lastItem = items[items.length - 1];
      const cursorData = `${lastItem.datetime}:${lastItem._id}`;
      nextCursor = Buffer.from(cursorData).toString('base64');
    }

    return {
      items,
      nextCursor,
      hasMore,
    };
  }
}
