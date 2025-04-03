import { BaseEventDto } from '@libs/dtos/src/rabbitmq/base-event.dto';
import { IsString, IsObject, IsNotEmpty } from 'class-validator';

export interface IEventPayload {
  ip: string;
  method: string;
  path: string;
  query: Record<string, any>;
  requestBody: Record<string, any>;
  responseBody: Record<string, any>;
  params: Record<string, any>;
  requestHeaders: Record<string, any>;
  responseHeaders: Record<string, any>;
}

export class EventPayload implements IEventPayload {
  @IsString()
  ip: string;

  @IsString()
  method: string;

  @IsString()
  path: string;

  @IsObject()
  query: Record<string, any>;

  @IsNotEmpty()
  requestBody: Record<string, any>;

  @IsNotEmpty()
  responseBody: Record<string, any>;

  @IsObject()
  params: Record<string, any>;

  @IsObject()
  requestHeaders: Record<string, any>;

  @IsObject()
  responseHeaders: Record<string, any>;
}

export class EventPayloadDto extends BaseEventDto<EventPayload> {}
