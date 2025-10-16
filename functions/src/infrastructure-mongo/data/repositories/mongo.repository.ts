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
      await this.uow.createAsync(doc, collection);
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
      await this.uow.createManyAsync(docs, collection);
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

  async updateSingleAsync(entity: TEntity): Promise<void> {
    const collection = this.getCollection();
    const filter = { _id: new BSON.ObjectId(entity.id) } as Filter<MongoDocument<TProps>>;
    if (this.uow) {
      const doc = this.mapper.toPartialDocument(entity);
      await this.uow.updateAsync(filter, doc, collection);
      return;
    }

    const doc = this.mapper.toPartialDocument(entity);
    await collection.updateOne(filter, { $set: doc });
  }

  async updateManyAsync(entities: TEntity[]): Promise<void> {
    const collection = this.getCollection();
    const docs = entities.map((entity) => {
      return { _id: new BSON.ObjectId(entity.id), ...this.mapper.toPartialDocument(entity) };
    }) as WithId<Partial<MongoDocument<TProps>>>[];
    if (this.uow) {
      await this.uow.updateManyAsync(docs, collection);
      return;
    }

    const operations: AnyBulkWriteOperation<MongoDocument<TProps>>[] = docs.map((doc) => {
      const { _id: id, ...rest } = doc;
      const filter = { _id: id } as Filter<MongoDocument<TProps>>;
      const update = { $set: rest as unknown as Partial<MongoDocument<TProps>> };
      return { updateOne: { filter, update } };
    });

    await collection.bulkWrite(operations);
  }

  deleteAsync(entity: TEntity): Promise<void>;
  deleteAsync(entities: TEntity[]): Promise<void>;
  deleteAsync(entities: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getAllAsync(): Promise<TEntity[]> {
    throw new Error("Method not implemented.");
  }
  queryAsync(query: Query<TProps>): Promise<PagedResult<TEntity>> {
    throw new Error("Method not implemented.");
  }

  protected getCollection(): Collection<MongoDocument<TProps>> {
    return this.context.db.collection<MongoDocument<TProps>>(this.entityFactory().namespace);
  }
}
