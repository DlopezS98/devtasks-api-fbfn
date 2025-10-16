import { ILabelsRepository } from "@Domain/abstractions/repositories/ilabels-repository";
import { IRefreshTokensRepository } from "@Domain/abstractions/repositories/irefresh-tokens-repository";
import { ITasksRepository } from "@Domain/abstractions/repositories/itasks-repository";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import { IUsersRepository } from "@Domain/abstractions/repositories/iusers-repository";
import { ClientSession } from "mongodb";

import { IMongoContext } from "../mongo.context";

import UsersRepository from "./users.repository";
import TasksRepository from "./tasks.repository";

export default class UnitOfWork implements IUnitOfWork {
  usersRepository: IUsersRepository;
  tasksRepository: ITasksRepository;
  labelsRepository!: ILabelsRepository;
  refreshTokensRepository!: IRefreshTokensRepository;
  private session: ClientSession | null = null;
  private affectedRows = 0;

  constructor(private readonly mongoContext: IMongoContext) {
    this.usersRepository = new UsersRepository(mongoContext, this);
    this.tasksRepository = new TasksRepository(mongoContext, this);
  }

  async attachSession(
    execute: (session: ClientSession) => Promise<number>,
  ): Promise<void> {
    if (!this.session) {
      this.session = this.mongoContext.client.startSession();
      this.session.startTransaction();
    }

    try {
      const operations = await execute(this.session);
      this.affectedRows += operations;
    } catch (error) {
      await this.session.abortTransaction();
      await this.dispose();
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
