import { AnyBulkWriteOperation, BSON, Collection, Condition, Filter, FindCursor, Sort, WithId } from "mongodb";
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";
import { Query, PagedResult, FilterDescriptor } from "@Domain/core/query";
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

  async queryAsync(query: Query<TProps>): Promise<PagedResult<TEntity>> {
    const collection = this.getCollection();

    // build the filter once and reuse for both the cursor and the count
    const filter = this.applyFilters({}, query.filters || []);
    const cursor = this.applyQueryConstraints(query, filter);

    const [docs, totalCount] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return {
      items: docs.map(this.mapper.fromDocument),
      skip: query.pagination?.skip ?? 0,
      take: query.pagination?.take ?? 0,
      totalCount: totalCount,
    };
  }

  protected applyQueryConstraints(
    query: Query<TProps>,
    filter: Filter<MongoDocument<TProps>> = {},
  ): FindCursor<WithId<MongoDocument<TProps>>> {
    const collection = this.getCollection();

    const mongoSort: Record<string, 1 | -1> = { _id: 1 };
    if (query.sorts) {
      for (const sort of query.sorts) {
        if (sort.field === "id") continue;

        const order = sort.direction === "asc" ? 1 : -1;
        mongoSort[String(sort.field)] = order;
      }
    }

    const cursor = collection.find(filter).sort(mongoSort as Sort);
    if (query.pagination) {
      if (query.pagination.skip) cursor.skip(query.pagination.skip);
      if (query.pagination.take) cursor.limit(query.pagination.take);
    }

    return cursor;
  }
  protected applyFilters<TDocument extends MongoDocument<TProps>, TKey extends keyof MongoDocument<TProps>>(
    mongoQuery: Filter<MongoDocument<TProps>>,
    filters: FilterDescriptor<TProps>[],
  ): Filter<MongoDocument<TProps>> {
    // helper to assign to mongoQuery while avoiding TypeScript index type issues
    const setField = (k: TKey, v: Condition<TDocument[TKey]> | TDocument[TKey] | BSON.ObjectId) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mongoQuery as any)[k] = v;
    };

    for (const filter of filters) {
      const isIdBasedFilter = filter.field === "id";
      const key = (isIdBasedFilter ? "_id" : filter.field) as TKey;
      const value = (isIdBasedFilter ? new BSON.ObjectId(String(filter.value)) : filter.value) as TDocument[TKey];

      switch (filter.operator) {
        case "eq":
          setField(key, value);
          break;
        case "ne":
          setField(key, { $ne: value } as Condition<TDocument[TKey]>);
          break;
        case "lt":
          setField(key, { $lt: value } as Condition<TDocument[TKey]>);
          break;
        case "lte":
          setField(key, { $lte: value } as Condition<TDocument[TKey]>);
          break;
        case "gt":
          setField(key, { $gt: value } as Condition<TDocument[TKey]>);
          break;
        case "gte":
          setField(key, { $gte: value } as Condition<TDocument[TKey]>);
          break;
        case "in":
          if (Array.isArray(filter.value)) {
            setField(key, { $in: value } as Condition<TDocument[TKey]>);
          }
          break;
        case "nin":
          if (Array.isArray(filter.value)) {
            setField(key, { $nin: value } as Condition<TDocument[TKey]>);
          }
          break;
        case "contains":
          if (typeof filter.value === "string") {
            setField(key, { $regex: value, $options: "i" } as Condition<TDocument[TKey]>);
          }
          break;
        default:
          throw new Error(`Unsupported filter operator: ${filter.operator}`);
      }
    }

    return mongoQuery;
  }

  protected getCollection(): Collection<MongoDocument<TProps>> {
    return this.context.db.collection<MongoDocument<TProps>>(this.entityFactory().namespace);
  }
}
