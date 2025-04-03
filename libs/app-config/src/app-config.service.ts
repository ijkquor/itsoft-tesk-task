import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  get openaqApiKey(): string {
    const key = this.configService.get<string>('OPENAQ_API_KEY');

    if (!key) {
      throw new Error('OPENAQ_API_KEY is not set');
    }

    return key;
  }

  get openaqApiUrl(): string {
    const url = this.configService.get<string>('OPENAQ_API_URL');

    if (!url) {
      throw new Error('OPENAQ_API_URL is not set');
    }

    return url;
  }

  get openaqApiCountryId(): number {
    const id = this.configService.get<number>('OPENAQ_API_COUNTRY_ID');

    if (!id) {
      throw new Error('OPENAQ_API_COUNTRY_ID is not set');
    }

    return id;
  }

  get pollutionPort(): number {
    return +this.configService.get<string>('POLLUTION_PORT', '3000');
  }

  get loggerPort(): number {
    return +this.configService.get<string>('LOGGER_PORT', '3001');
  }
}
