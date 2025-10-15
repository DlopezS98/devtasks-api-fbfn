import { ILabelsRepository } from "@Domain/abstractions/repositories/ilabels-repository";
import { IRefreshTokensRepository } from "@Domain/abstractions/repositories/irefresh-tokens-repository";
import { ITasksRepository } from "@Domain/abstractions/repositories/itasks-repository";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import { IUsersRepository } from "@Domain/abstractions/repositories/iusers-repository";
import User, { UserProps } from "@Domain/entities/user.entity";
import Task, { TaskProps } from "@Domain/entities/task.entity";
import { ClientSession, Collection, OptionalUnlessRequiredId } from "mongodb";
import { BaseEntityProps } from "@Domain/entities/base-entity";
import { MongoDocument } from "@Infrastructure/Mongo/models/mongo-document";

import { IMongoContext } from "../mongo.context";

import MongoRepository from "./mongo.repository";

export default class UnitOfWork implements IUnitOfWork {
  usersRepository: IUsersRepository;
  tasksRepository!: ITasksRepository;
  labelsRepository!: ILabelsRepository;
  refreshTokensRepository!: IRefreshTokensRepository;
  private session: ClientSession | null = null;
  private affectedRows = 0;

  constructor(private readonly mongoContext: IMongoContext) {
    this.usersRepository = new MongoRepository<User, UserProps>(mongoContext, User.empty, this);
    this.tasksRepository = new MongoRepository<Task, TaskProps>(mongoContext, Task.empty, this);
  }

  async createManyAsync<TProps extends BaseEntityProps>(
    docs: OptionalUnlessRequiredId<MongoDocument<TProps>>[],
    collection: Collection<MongoDocument<TProps>>,
  ): Promise<void> {
    try {
      if (!this.session) {
        this.session = this.mongoContext.client.startSession();
        this.session.startTransaction();
      }

      await collection.insertMany(docs, { session: this.session });
      this.affectedRows += docs.length;
    } catch (error) {
      if (this.session) {
        await this.session.abortTransaction();
        await this.dispose();
      }
      throw error;
    }
  }

  async createAsync<TProps extends BaseEntityProps>(
    doc: OptionalUnlessRequiredId<MongoDocument<TProps>>,
    collection: Collection<MongoDocument<TProps>>,
  ): Promise<void> {
    try {
      if (!this.session) {
        this.session = this.mongoContext.client.startSession();
        this.session.startTransaction();
      }

      await collection.insertOne(doc, { session: this.session });
      this.affectedRows++;
    } catch (error) {
      if (this.session) {
        await this.session.abortTransaction();
        await this.dispose();
      }
      throw error;
    }
  }

  async saveChangesAsync(): Promise<number> {
    if (!this.session) return 0;

    try {
      await this.session.commitTransaction();
    } catch (error) {
      await this.session.abortTransaction();
    } finally {
      await this.dispose();
    }

    const totalAffectedRows = this.affectedRows; // Store the affected rows before resetting
    await this.reset();
    return totalAffectedRows;
  }

  withTransaction<T>(_: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    throw new Error("Method not implemented.");
  }

  async dispose(): Promise<void> {
    if (!this.session) return;

    await this.session.endSession();
  }

  reset(): Promise<void> {
    this.session = null;
    this.affectedRows = 0;
    return Promise.resolve();
  }
}
