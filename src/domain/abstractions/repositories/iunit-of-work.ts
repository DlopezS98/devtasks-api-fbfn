import User from "@Domain/entities/user";
import { IAsyncRepository } from "./iasync-repository";
import Task from "@Domain/entities/task.entity";

export interface IUnitOfWork {
  readonly usersRepository: IAsyncRepository<User>;
  readonly tasksRepository: IAsyncRepository<Task>;

  /** Commits the current unit of work */
  saveChangesAsync(): Promise<number>;
  /** Executes a unit of work within a transaction */
  withTransaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  /** Disposes the unit of work, releasing any resources */
  dispose(): Promise<void>;
  /** Resets the unit of work to its initial state */
  reset(): Promise<void>;
}
