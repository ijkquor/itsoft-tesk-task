import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { AppConfigService } from '@libs/app-config';
import {
  IngestionResponseDto,
  LocationsResponseDto,
  SensorResultDto,
  SensorsResponseDto,
} from '@libs/dtos';
import { MeasurementResultDto } from '@libs/dtos/src/measurement-result.dto';
import { MeasurementsResponseDto } from '@libs/dtos/src/measurements-response.dto';
import { LocationsResultDto } from '@libs/dtos/src/locations-result.dto';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfigService: AppConfigService,
  ) {}

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount = 0,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount < this.maxRetries) {
        this.logger.warn(
          `Request failed, retrying (${retryCount + 1}/${this.maxRetries})...`,
        );
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      throw error;
    }
  }

  private async fetchAirQualityData(
    startDate: string,
    endDate: string,
  ): Promise<(MeasurementResultDto & { location: LocationsResultDto })[]> {
    try {
      const locationsInCountry = await this.retryRequest(() =>
        firstValueFrom(
          this.httpService.get<LocationsResponseDto>(
            `${this.appConfigService.openaqApiUrl}/v3/locations`,
            {
              params: {
                countries_id: this.appConfigService.openaqApiCountryId,
              },
              headers: {
                'X-Api-Key': this.appConfigService.openaqApiKey,
              },
            },
          ),
        ),
      );

      const sensors: (SensorResultDto & { location: LocationsResultDto })[] =
        [];

      for (const location of locationsInCountry.data.results) {
        try {
          const sensorData = await this.retryRequest(() =>
            firstValueFrom(
              this.httpService.get<SensorsResponseDto>(
                `${this.appConfigService.openaqApiUrl}/v3/locations/${location.id}/sensors`,
                {
                  headers: {
                    'X-Api-Key': this.appConfigService.openaqApiKey,
                  },
                },
              ),
            ),
          );

          sensors.push(
            ...sensorData.data.results.map((sensor) => ({
              ...sensor,
              location: location,
            })),
          );

          this.logger.log(
            `Fetched ${sensorData.data.results.length} sensors (${
              sensors.length
            } total)`,
          );

          if (sensors.length >= 25) {
            this.logger.log(
              `Enough of sensors were gathered. (${sensors.length})`,
            );

            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          this.logger.warn(
            `Failed to fetch sensors for location ${location.id}:`,
            error,
          );

          continue;
        }
      }

      const enrichedMeasurements: (MeasurementResultDto & {
        location: LocationsResultDto;
      })[] = [];

      for (const sensor of sensors) {
        try {
          const measurement = await this.retryRequest(() =>
            firstValueFrom(
              this.httpService.get<MeasurementsResponseDto>(
                `${this.appConfigService.openaqApiUrl}/v3/sensors/${sensor.id}/measurements`,
                {
                  params: {
                    datetime_from: startDate,
                    datetime_to: endDate,
                    limit: 1000,
                  },
                  headers: {
                    'X-Api-Key': this.appConfigService.openaqApiKey,
                  },
                },
              ),
            ),
          );

          enrichedMeasurements.push(
            ...measurement.data.results.map((measurement) => ({
              ...measurement,
              location: sensor.location,
            })),
          );

          this.logger.log(
            `Fetched ${measurement.data.results.length} measurements (${
              enrichedMeasurements.length
            } total) for sensor ${sensor.id}`,
          );

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          this.logger.warn(
            `Failed to fetch measurements for sensor ${sensor.id}:`,
            error,
          );
        }
      }

      return enrichedMeasurements;
    } catch (error) {
      this.logger.error('Error fetching air quality data:', error);
      throw error;
    }
  }

  async exportToJson(startDate: string, endDate: string): Promise<Buffer> {
    const data = await this.fetchAirQualityData(startDate, endDate);

    const result = data.map((entry) => ({
      datetime: entry.period.datetimeFrom.utc,
      parameter: entry.parameter.name,
      value: entry.value,
      location: entry.location.name || 'N/A',
      longitude: entry.location.coordinates?.longitude || 'N/A',
      latitude: entry.location.coordinates?.latitude || 'N/A',
    })) as IngestionResponseDto[];

    return Buffer.from(JSON.stringify(result, null, 2));
  }

  async exportToExcel(startDate: string, endDate: string): Promise<Buffer> {
    const data = await this.fetchAirQualityData(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Air Quality Data');

    worksheet.columns = [
      { header: 'Date (UTC)', key: 'datetime' },
      { header: 'Parameter', key: 'parameter' },
      { header: 'Value', key: 'value' },
      { header: 'Location', key: 'location' },
      { header: 'Longitude', key: 'longitude' },
      { header: 'Latitude', key: 'latitude' },
    ];

    const rows = data.map((entry) => ({
      datetime: entry.period.datetimeFrom.utc,
      parameter: entry.parameter.name,
      value: entry.value,
      location: entry.location.name || 'N/A',
      longitude: entry.location.coordinates?.longitude || 'N/A',
      latitude: entry.location.coordinates?.latitude || 'N/A',
    })) as IngestionResponseDto[];

    worksheet.addRows(rows);

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }
}
