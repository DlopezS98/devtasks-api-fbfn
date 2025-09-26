/* eslint-disable require-jsdoc */
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity from "@Domain/entities/base-entity";
import { CollectionReference } from "firebase-admin/firestore";
import { FilterDescriptor, PagedResult, Query } from "@Domain/core/query";

import FactoryConverter from "../converters/factory-converter";

import UnitOfWork from "./unit-of-work";

/**
 * Generic Firestore repository implementation.
 * This class provides basic CRUD operations for entities of type TEntity.
 */
export default class FirestoreRepository<TEntity extends BaseEntity> implements IAsyncRepository<TEntity> {
  constructor(
    protected readonly firestore: FirebaseFirestore.Firestore,
    protected readonly uow: UnitOfWork,
    private readonly entityFactory: () => TEntity,
  ) {}

  async addAsync(entity: TEntity): Promise<TEntity>;
  async addAsync(entities: TEntity[]): Promise<TEntity[]>;
  async addAsync(entities: TEntity | TEntity[]): Promise<TEntity | TEntity[]> {
    if (Array.isArray(entities)) {
      return this.addMany(entities);
    } else {
      return this.addSingle(entities);
    }
  }

  private addSingle(entity: TEntity): TEntity {
    entity.id = this.collectionRef().doc().id;
    this.uow.set(this.collectionRef().doc(entity.id), entity);
    return entity;
  }

  private addMany(entities: TEntity[]): TEntity[] {
    if (entities.length === 0) return [];

    entities.forEach(this.addSingle.bind(this));
    return entities;
  }

  async getAsync(id: string): Promise<TEntity | null> {
    const ref = this.collectionRef().doc(id);
    const doc = await ref.get();
    return doc.exists ? (doc.data() as TEntity) : null;
  }

  async updateAsync(entity: TEntity): Promise<void>;
  async updateAsync(entities: TEntity[]): Promise<void>;
  async updateAsync(entities: TEntity | TEntity[]): Promise<void> {
    if (Array.isArray(entities)) {
      return this.updateMany(entities);
    } else {
      return this.updateSingle(entities);
    }
  }

  private updateMany(entities: TEntity[]): void {
    if (entities.length === 0) return;

    entities.forEach(this.updateSingle.bind(this));
  }

  private updateSingle(entity: TEntity): void {
    this.uow.update(this.collectionRef().doc(entity.id), entity);
  }

  async deleteAsync(entity: TEntity): Promise<void>;
  async deleteAsync(entities: TEntity[]): Promise<void>;
  async deleteAsync(entities: TEntity | TEntity[]): Promise<void> {
    if (Array.isArray(entities)) {
      return this.deleteMany(entities);
    } else {
      return this.deleteSingle(entities);
    }
  }

  private deleteMany(entities: TEntity[]): void {
    if (entities.length === 0) return;

    entities.forEach(this.deleteSingle.bind(this));
  }

  private deleteSingle(entity: TEntity): void {
    this.uow.delete(this.collectionRef().doc(entity.id));
  }

  async getAllAsync(): Promise<TEntity[]> {
    const querySnapshot = await this.collectionRef().get();
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async queryAsync(query: Query<TEntity>): Promise<PagedResult<TEntity>> {
    const firestoreQuery = this.applyQueryConstraints(query);
    const querySnapshot = await firestoreQuery.get();

    if (querySnapshot.empty) {
      return {
        items: [],
        skip: query.pagination?.skip ?? 0,
        take: query.pagination?.take ?? 0,
        totalCount: 0,
      };
    }

    // Get total count (without pagination)
    // For efficiency, if no filters, use count from collection
    let totalCount: number;
    if (query.filter && query.filter.length > 0) {
      const countSnapshot = await this.applyQueryConstraints({ filter: query.filter }).count().get();
      totalCount = countSnapshot.data().count;
    } else {
      const collectionSnapshot = await this.collectionRef().count().get();
      totalCount = collectionSnapshot.data().count;
    }

    return {
      items: querySnapshot.docs.map((doc) => doc.data()),
      skip: query.pagination?.skip ?? 0,
      take: query.pagination?.take ?? 0,
      totalCount: totalCount,
    };
  }

  protected applyQueryConstraints(query: Query<TEntity>): FirebaseFirestore.Query<TEntity> {
    let firestoreQuery: FirebaseFirestore.Query<TEntity> = this.collectionRef();

    // Apply filtering
    if (query.filter) {
      this.applyFilters(firestoreQuery, query.filter);
    }

    // Apply sorting
    if (query.sort) {
      query.sort.forEach((sort) => {
        firestoreQuery = firestoreQuery.orderBy(sort.field as string, sort.direction);
      });
    }

    // Apply pagination
    // Note: Firestore uses 'offset' and 'limit' for pagination
    // but it will read skipped documents and count towards billing.
    // TODO: For large datasets, consider using cursor-based pagination.
    if (query.pagination) {
      const { skip, take } = query.pagination;
      if (skip !== null) firestoreQuery = firestoreQuery.offset(skip);
      if (take !== null) firestoreQuery = firestoreQuery.limit(take);
    }

    return firestoreQuery;
  }

  // apply filters
  protected applyFilters(firestoreQuery: FirebaseFirestore.Query<TEntity>, filters: FilterDescriptor<TEntity>[]): void {
    for (const filter of filters) {
      switch (filter.operator) {
        case "eq":
          firestoreQuery = firestoreQuery.where(filter.field as string, "==", filter.value);
          break;
        case "ne":
          firestoreQuery = firestoreQuery.where(filter.field as string, "!=", filter.value);
          break;
        case "gt":
          firestoreQuery = firestoreQuery.where(filter.field as string, ">", filter.value);
          break;
        case "lt":
          firestoreQuery = firestoreQuery.where(filter.field as string, "<", filter.value);
          break;
        case "gte":
          firestoreQuery = firestoreQuery.where(filter.field as string, ">=", filter.value);
          break;
        case "lte":
          firestoreQuery = firestoreQuery.where(filter.field as string, "<=", filter.value);
          break;
        case "in":
          if (Array.isArray(filter.value)) {
            firestoreQuery = firestoreQuery.where(filter.field as string, "in", filter.value);
          }
          break;
        case "nin":
          if (Array.isArray(filter.value)) {
            firestoreQuery = firestoreQuery.where(filter.field as string, "not-in", filter.value);
          }
          break;
        case "contains":
          // Firestore does not support 'contains' directly; but we can use array-contains for array fields
          firestoreQuery = firestoreQuery.where(filter.field as string, "array-contains", filter.value);
          break;
        default:
          throw new Error(`Unsupported operator: ${filter.operator}`);
      }
    }
  }

  protected collectionRef(): CollectionReference<TEntity> {
    const entity = this.entityFactory();
    return this.firestore.collection(entity.namespace).withConverter(FactoryConverter.createConverter(entity));
  }
}
