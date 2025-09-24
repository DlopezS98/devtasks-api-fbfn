import { IAsyncRepository } from "@Domain/abstractions/repositories/iasync-repository";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import Task from "@Domain/entities/task.entity";
import User from "@Domain/entities/user";
import FirestoreContext from "../firestore.context";
import FirestoreRepository from "./firestore.repository";
import BaseEntity from "@Domain/entities/base-entity";
import { DocumentReference, Precondition, UpdateData } from "firebase-admin/firestore";
import RefreshToken from "@Domain/entities/refresh-token.entity";
// import { WriteBatch } from "firebase-admin/firestore";

/* eslint-disable require-jsdoc */
export default class UnitOfWork implements IUnitOfWork {
  public readonly usersRepository: IAsyncRepository<User>;
  public readonly tasksRepository: IAsyncRepository<Task>;
  public readonly refreshTokensRepository: IAsyncRepository<RefreshToken>;

  private readonly firestore: FirebaseFirestore.Firestore;
  private batch: FirebaseFirestore.WriteBatch | null = null;
  private transaction: FirebaseFirestore.Transaction | null = null;
  private pendingOperations = 0;

  constructor(context: FirestoreContext, tx: FirebaseFirestore.Transaction | null = null) {
    this.firestore = context.firestore();
    this.transaction = tx;
    this.batch = this.transaction ? null : this.firestore.batch();
    this.usersRepository = new FirestoreRepository<User>(this.firestore, this, () => User.empty());
    this.tasksRepository = new FirestoreRepository<Task>(this.firestore, this, () => Task.empty());
    this.refreshTokensRepository = new FirestoreRepository<RefreshToken>(this.firestore, this, () =>
      RefreshToken.empty(),
    );
  }

  public set<TEntity extends BaseEntity>(ref: DocumentReference<TEntity>, entity: TEntity): void {
    if (this.transaction) {
      this.transaction.set(ref, entity);
    } else if (this.batch) {
      this.batch.set(ref, entity);
    } else {
      throw new Error("No active batch or transaction");
    }

    this.pendingOperations++;
  }

  public update<TEntity extends BaseEntity>(
    ref: DocumentReference<TEntity>,
    entity: Partial<TEntity>,
    precondition?: Precondition,
  ): void {
    if (this.transaction) {
      this.transaction.update(ref, entity as UpdateData<TEntity>, precondition);
    } else if (this.batch) {
      this.batch.update(ref, entity as UpdateData<TEntity>, precondition);
    } else {
      throw new Error("No active batch or transaction");
    }

    this.pendingOperations++;
  }

  public delete<TEntity extends BaseEntity>(ref: DocumentReference<TEntity>, precondition?: Precondition): void {
    if (this.transaction) {
      this.transaction.delete(ref, precondition);
    } else if (this.batch) {
      precondition ? this.batch.delete(ref, precondition) : this.batch.delete(ref);
    } else {
      throw new Error("No active batch or transaction");
    }

    this.pendingOperations++;
  }

  async saveChangesAsync(): Promise<number> {
    if (this.transaction) {
      // In a transaction, changes are committed when the transaction completes
      const count = this.pendingOperations;
      this.pendingOperations = 0;
      return count;
    }

    if (!this.batch) return 0;

    await this.batch.commit();
    const count = this.pendingOperations;
    this.reset();
    return count;
  }

  withTransaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return this.firestore.runTransaction(async (transaction) => {
      const scopedUow = new UnitOfWork(FirestoreContext.getInstance(), transaction);
      return work(scopedUow);
    });
  }

  dispose(): Promise<void> {
    this.batch = null;
    this.transaction = null;
    return Promise.resolve();
  }

  reset(): Promise<void> {
    this.batch = this.firestore.batch();
    this.pendingOperations = 0;
    return Promise.resolve();
  }
}
