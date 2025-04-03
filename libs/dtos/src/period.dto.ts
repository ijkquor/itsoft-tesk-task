import { DateTimeDto } from './datetime.dto';

export class PeriodDto {
  label: string;
  interval: string;
  datetimeFrom: DateTimeDto;
  datetimeTo: DateTimeDto;
}
