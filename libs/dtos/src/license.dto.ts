import { AttributionDto } from './attribution.dto';

export class LicenseDto {
  id: number;
  name: string;
  attribution: AttributionDto;
  dateFrom: string;
  dateTo: string | null;
}
