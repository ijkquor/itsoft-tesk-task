import { BaseResponseDto } from '@libs/dtos/src/base/base-response.dto';
import { EventModel } from '@libs/mongo';

export class EventSearchResponseDto extends BaseResponseDto<EventModel> {}
