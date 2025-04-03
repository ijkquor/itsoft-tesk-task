import { IEventPayload } from '@libs/dtos';
import { BaseModel } from './base.model';

export interface EventModel extends BaseModel, IEventPayload {}
