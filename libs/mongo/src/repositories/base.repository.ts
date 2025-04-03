import { Collection, Filter, OptionalUnlessRequiredId, WithId } from 'mongodb';
import { BaseModel } from '../models/base.model';
import { MongoService } from '../mongo.service';

export abstract class BaseRepository<T extends BaseModel> {
  protected readonly collection: Collection<T>;

  constructor(
    protected readonly mongoService: MongoService,
    protected readonly collectionName: string,
  ) {
    this.collection = this.mongoService.getCollection<T>(this.collectionName);
  }

  /**
   * This method is used to synchronize the collection with the database.
   * @param _mongoService - The mongo service.
   * @returns A promise that resolves to void.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async synchronization(_mongoService: MongoService): Promise<void> {
    // Here lies indexation and etc.

    return Promise.resolve();
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<T> {
    const now = new Date();
    const document = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(document);
    return { ...document, _id: result.insertedId } as T;
  }

  async findById(id: string): Promise<WithId<T> | null> {
    return this.collection.findOne({ _id: id } as Filter<T>);
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    return this.collection.findOne(filter);
  }

  async find(filter: Filter<T> = {}): Promise<WithId<T>[]> {
    return this.collection.find(filter).toArray();
  }

  async update(id: string, data: Partial<T>): Promise<WithId<T> | null> {
    const update = {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: id } as Filter<T>,
      update,
      { returnDocument: 'after' },
    );

    return result;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.collection.updateOne({ _id: id } as Filter<T>, {
      $set: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Partial<T>,
    });

    return result.modifiedCount > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: id } as Filter<T>);
    return result.deletedCount > 0;
  }

  async count(filter: Filter<T> = {}): Promise<number> {
    return this.collection.countDocuments(filter);
  }

  async createMany(dataArray: OptionalUnlessRequiredId<T>[]): Promise<T[]> {
    const now = new Date();
    const documents = dataArray.map((data) => ({
      ...data,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await this.collection.insertMany(documents);
    return documents.map((doc, index) => ({
      ...doc,
      _id: result.insertedIds[index],
    })) as T[];
  }

  getCollection(): Collection<T> {
    return this.collection;
  }
}
