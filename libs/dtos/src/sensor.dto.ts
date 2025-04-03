import { ParameterDto } from './parameter.dto';

export class SensorDto {
  id: number;
  name: string;
  parameter: ParameterDto;
}
