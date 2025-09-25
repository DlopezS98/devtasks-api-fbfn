/* eslint-disable require-jsdoc */
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity from "@Domain/entities/base-entity";
import { CollectionReference } from "firebase-admin/firestore";

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
    return doc.exists ? doc.data() as TEntity : null;
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

  async listAsync(): Promise<TEntity[]> {
    const querySnapshot = await this.collectionRef()
      .get();
    return querySnapshot.docs.map((doc) => doc.data());
  }

  protected collectionRef(): CollectionReference<TEntity> {
    const entity = this.entityFactory();
    return this.firestore
      .collection(entity.namespace)
      .withConverter(FactoryConverter.createConverter(entity));
  }
}
