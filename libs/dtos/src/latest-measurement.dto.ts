import { DateTimeDto } from './datetime.dto';
import { CoordinatesDto } from './coordinates.dto';

export class LatestMeasurementDto {
  datetime: DateTimeDto;
  value: number;
  coordinates: CoordinatesDto;
}
