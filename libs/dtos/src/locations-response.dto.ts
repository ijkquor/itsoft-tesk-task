import { MetaDto } from './meta.dto';
import { LocationsResultDto } from './locations-result.dto';

export class LocationsResponseDto {
  meta: MetaDto;
  results: LocationsResultDto[];
}
