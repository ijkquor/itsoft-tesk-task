import { Document } from 'mongodb';

export interface BaseModel extends Document {
  _id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
