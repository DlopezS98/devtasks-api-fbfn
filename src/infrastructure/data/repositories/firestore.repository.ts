/* eslint-disable require-jsdoc */
import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import BaseEntity from "@Domain/entities/base-entity";
import UnitOfWork from "./unit-of-work";
import FactoryConverter from "../converters/factory-converter";

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

  addAsync(entity: TEntity): Promise<TEntity>;
  addAsync(entities: TEntity[]): Promise<TEntity[]>;
  addAsync(entities: unknown): Promise<TEntity> | Promise<TEntity[]> {
    throw new Error("Method not implemented.");
  }

  getAsync(id: string): Promise<TEntity | null> {
    throw new Error("Method not implemented.");
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
    const entity = this.entityFactory();
    const querySnapshot = await this.firestore
      .collection(entity.namespace)
      .withConverter(FactoryConverter.createConverter(entity))
      .get();
    return querySnapshot.docs.map((doc) => doc.data());
  }

  async saveChangesAsync(): Promise<number> {
    throw new Error("Method not implemented.");
  }
}
