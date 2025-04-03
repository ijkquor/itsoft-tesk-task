import {
  IsOptional,
  IsString,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';

export class BaseEventDto<T> {
  @IsString()
  @IsNotEmpty()
  emitter: string;

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  payload?: T;
}
