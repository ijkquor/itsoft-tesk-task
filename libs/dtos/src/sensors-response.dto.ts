import { MetaDto } from './meta.dto';
import { SensorResultDto } from './sensor-result.dto';

export class SensorsResponseDto {
  meta: MetaDto;
  results: SensorResultDto[];
}
