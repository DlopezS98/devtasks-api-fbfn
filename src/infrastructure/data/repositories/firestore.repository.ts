/* eslint-disable require-jsdoc */
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity from "@Domain/entities/base-entity";
import UnitOfWork from "./unit-of-work";
import FactoryConverter from "../converters/factory-converter";
import { CollectionReference } from "firebase-admin/firestore";

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

  updateAsync(entity: TEntity): Promise<void>;
  updateAsync(entities: TEntity[]): Promise<void>;
  updateAsync(entities: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteAsync(id: string): Promise<void>;
  deleteAsync(entities: TEntity[]): Promise<void>;
  deleteAsync(entities: unknown): Promise<void> {
    throw new Error("Method not implemented.");
  }

  async listAsync(): Promise<TEntity[]> {
    const querySnapshot = await this.collectionRef()
      .get();
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async saveChangesAsync(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  private collectionRef(): CollectionReference<TEntity> {
    const entity = this.entityFactory();
    return this.firestore
      .collection(entity.namespace)
      .withConverter(FactoryConverter.createConverter(entity));
  }
}
