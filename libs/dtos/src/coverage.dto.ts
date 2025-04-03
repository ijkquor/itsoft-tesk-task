import { DateTimeDto } from './datetime.dto';

export class CoverageDto {
  expectedCount: number;
  expectedInterval: string;
  observedCount: number;
  observedInterval: string;
  percentComplete: number;
  percentCoverage: number;
  datetimeFrom: DateTimeDto;
  datetimeTo: DateTimeDto;
}
