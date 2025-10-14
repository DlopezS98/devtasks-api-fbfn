import { BSON, ClientSession, Collection, Filter } from "mongodb";
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";
import { Query, PagedResult } from "@Domain/core/query";
import BaseMapper from "@Infrastructure/Mongo/abstractions/base-mapper";
import { MongoDocument } from "@Infrastructure/Mongo/models/mongo-document";

import { IMongoContext } from "../mongo.context";
import FactoryMapper from "../mapper/factory-mapper";

// eslint-disable-next-line max-len
export default class MongoRepository<TEntity extends BaseEntity, TProps extends BaseEntityProps>
  implements IAsyncRepository<TEntity, TProps> {
  protected readonly mapper: BaseMapper<TEntity, TProps>;

  constructor(
    protected readonly context: IMongoContext,
    protected readonly entityFactory: () => TEntity,
    protected readonly session?: ClientSession,
  ) {
    this.mapper = FactoryMapper.createMapper(this.entityFactory());
  }

  async addAsync(entity: TEntity): Promise<TEntity>;
  async addAsync(entities: TEntity[]): Promise<TEntity[]>;
  async addAsync(entities: TEntity | TEntity[]): Promise<TEntity[] | TEntity> {
    const collection = this.getCollection();

    if (Array.isArray(entities)) {
      const docs = entities.map(this.mapper.toDocument);
      const inserted = await collection.insertMany(docs, { session: this.session });
      return docs.map((doc, i) => this.mapper.fromDocument({ ...doc, _id: inserted.insertedIds[i] }));
    } else {
      const doc = this.mapper.toDocument(entities);
      const result = await collection.insertOne(doc, { session: this.session });
      return this.mapper.fromDocument({ ...doc, _id: result.insertedId });
    }
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
