import { ParameterDto } from './parameter.dto';
import { PeriodDto } from './period.dto';
import { CoordinatesDto } from './coordinates.dto';
import { SummaryDto } from './summary.dto';
import { CoverageDto } from './coverage.dto';
import { FlagInfoDto } from './flag-info.dto';

export class MeasurementResultDto {
  value: number;
  flagInfo: FlagInfoDto;
  parameter: ParameterDto;
  period: PeriodDto;
  coordinates: CoordinatesDto | null;
  summary: SummaryDto | null;
  coverage: CoverageDto;
}
