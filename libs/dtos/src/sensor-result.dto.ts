import { DateTimeDto } from './datetime.dto';
import { ParameterDto } from './parameter.dto';
import { CoverageDto } from './coverage.dto';
import { LatestMeasurementDto } from './latest-measurement.dto';
import { SummaryDto } from './summary.dto';

export class SensorResultDto {
  id: number;
  name: string;
  parameter: ParameterDto;
  datetimeFirst: DateTimeDto;
  datetimeLast: DateTimeDto;
  coverage: CoverageDto;
  latest: LatestMeasurementDto;
  summary: SummaryDto;
}
