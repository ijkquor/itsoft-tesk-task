import { CoordinatesDto } from './coordinates.dto';
import { CountryDto } from './country.dto';
import { DateTimeDto } from './datetime.dto';
import { InstrumentDto } from './instrument.dto';
import { LicenseDto } from './license.dto';
import { OrganizationDto } from './organization.dto';
import { SensorDto } from './sensor.dto';

export class LocationsResultDto {
  id: number;
  name: string;
  locality: string | null;
  timezone: string;
  country: CountryDto;
  owner: OrganizationDto;
  provider: OrganizationDto;
  isMobile: boolean;
  isMonitor: boolean;
  instruments: InstrumentDto[];
  sensors: SensorDto[];
  coordinates: CoordinatesDto;
  licenses: LicenseDto[];
  bounds: number[];
  distance: number | null;
  datetimeFirst: DateTimeDto;
  datetimeLast: DateTimeDto;
}
