import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThrottlerConfigService {
  constructor(private readonly configService: ConfigService) {}

  get ttl(): number {
    return this.configService.get<number>('THROTTLE_TTL') || 60;
  }

  get limit(): number {
    return this.configService.get<number>('THROTTLE_LIMIT') || 100;
  }
}
