import { BSON, Collection, Filter } from "mongodb";
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
  updateAsync(entities: unknown): Promise<void> {
    throw new Error("Method not implemented.");
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
