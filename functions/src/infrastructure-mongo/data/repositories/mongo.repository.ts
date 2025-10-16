import { AnyBulkWriteOperation, BSON, Collection, Filter, WithId } from "mongodb";
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";
import { Query, PagedResult } from "@Domain/core/query";
import BaseMapper from "@Infrastructure/Mongo/abstractions/base-mapper";
import { MongoDocument } from "@Infrastructure/Mongo/models/mongo-document";

import { IMongoContext } from "../mongo.context";

import UnitOfWork from "./unit-of-work";

export default class MongoRepository<TEntity extends BaseEntity, TProps extends BaseEntityProps>
  implements IAsyncRepository<TEntity, TProps> {
  constructor(
    protected readonly context: IMongoContext,
    protected readonly entityFactory: () => TEntity,
    protected readonly mapper: BaseMapper<TEntity, TProps>,
    protected readonly uow?: UnitOfWork,
  ) {}

  async addAsync(entity: TEntity): Promise<TEntity>;
  async addAsync(entities: TEntity[]): Promise<TEntity[]>;
  async addAsync(entities: TEntity | TEntity[]): Promise<TEntity[] | TEntity> {
    return Array.isArray(entities) ? this.createManyAsync(entities) : this.createAsync(entities);
  }

  private async createAsync(entity: TEntity): Promise<TEntity> {
    const collection = this.getCollection();
    if (this.uow) {
      const doc = this.mapper.toDocument(entity);
      await this.uow.attachSession(async (session) => {
        await collection.insertOne(doc, { session });
        return 1;
      });
      return this.mapper.fromDocument(doc);
    }

    const doc = this.mapper.toDocument(entity);
    await collection.insertOne(doc);
    return this.mapper.fromDocument(doc);
  }

  private async createManyAsync(entities: TEntity[]): Promise<TEntity[]> {
    const collection = this.getCollection();
    if (this.uow) {
      const docs = entities.map(this.mapper.toDocument);
      await this.uow.attachSession(async (session) => {
        await collection.insertMany(docs, { session });
        return docs.length;
      });
      return docs.map(this.mapper.fromDocument);
    }

    const docs = entities.map(this.mapper.toDocument);
    await collection.insertMany(docs);
    return docs.map(this.mapper.fromDocument);
  }

  async getAsync(id: string): Promise<TEntity | null> {
    const collection = this.getCollection();
    const query = { _id: new BSON.ObjectId(id) } as Filter<MongoDocument<TProps>>;
    const document = await collection.findOne(query);
    if (!document) return null;

    return this.mapper.fromDocument(document);
  }

  updateAsync(entity: TEntity): Promise<void>;
  updateAsync(entities: TEntity[]): Promise<void>;
  updateAsync(entities: TEntity | TEntity[]): Promise<void> {
    return Array.isArray(entities) ? this.updateManyAsync(entities) : this.updateSingleAsync(entities);
  }

  private async updateSingleAsync(entity: TEntity): Promise<void> {
    const collection = this.getCollection();
    const filter = { _id: new BSON.ObjectId(entity.id) } as Filter<MongoDocument<TProps>>;
    const doc = this.mapper.toPartialDocument(entity);

    if (this.uow) {
      await this.uow.attachSession(async (session) => {
        await collection.updateOne(filter, { $set: doc }, { session });
        return 1;
      });
      return;
    }

    await collection.updateOne(filter, { $set: doc });
  }

  private async updateManyAsync(entities: TEntity[]): Promise<void> {
    const collection = this.getCollection();
    const docs = entities.map((entity) => {
      return { _id: new BSON.ObjectId(entity.id), ...this.mapper.toPartialDocument(entity) };
    }) as WithId<Partial<MongoDocument<TProps>>>[];

    const operations: AnyBulkWriteOperation<MongoDocument<TProps>>[] = docs.map((doc) => {
      const { _id: id, ...rest } = doc;
      const filter = { _id: id } as Filter<MongoDocument<TProps>>;
      const update = { $set: rest as unknown as Partial<MongoDocument<TProps>> };
      return { updateOne: { filter, update } };
    });

    if (this.uow) {
      await this.uow.attachSession(async (session) => {
        const result = await collection.bulkWrite(operations, { session });
        return result.modifiedCount;
      });
      return;
    }

    await collection.bulkWrite(operations);
  }

  deleteAsync(entity: TEntity): Promise<void>;
  deleteAsync(entities: TEntity[]): Promise<void>;
  deleteAsync(entities: TEntity | TEntity[]): Promise<void> {
    return Array.isArray(entities) ? this.deleteManyAsync(entities) : this.deleteSingleAsync(entities);
  }

  private async deleteSingleAsync(entity: TEntity): Promise<void> {
    const collection = this.getCollection();
    const filter = { _id: new BSON.ObjectId(entity.id) } as Filter<MongoDocument<TProps>>;

    if (this.uow) {
      await this.uow.attachSession(async (session) => {
        await collection.deleteOne(filter, { session });
        return 1;
      });
      return;
    }

    await collection.deleteOne(filter);
  }

  private async deleteManyAsync(entities: TEntity[]): Promise<void> {
    const collection = this.getCollection();
    const ids = entities.map((entity) => new BSON.ObjectId(entity.id));
    const filter = { _id: { $in: ids } } as Filter<MongoDocument<TProps>>;

    if (this.uow) {
      await this.uow.attachSession(async (session) => {
        const result = await collection.deleteMany(filter, { session });
        return result.deletedCount;
      });
      return;
    }

    await collection.deleteMany(filter);
  }

  async getAllAsync(): Promise<TEntity[]> {
    const collection = this.getCollection();
    const documents = await collection.find().toArray();
    return documents.map(this.mapper.fromDocument);
  }

  queryAsync(query: Query<TProps>): Promise<PagedResult<TEntity>> {
    throw new Error("Method not implemented.");
  }

  protected getCollection(): Collection<MongoDocument<TProps>> {
    return this.context.db.collection<MongoDocument<TProps>>(this.entityFactory().namespace);
  }
}
