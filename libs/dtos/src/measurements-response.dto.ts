import { MetaDto } from './meta.dto';
import { MeasurementResultDto } from './measurement-result.dto';

export class MeasurementsResponseDto {
  meta: MetaDto;
  results: MeasurementResultDto[];
}
