import Task from "@Domain/entities/task.entity";

import { IAsyncRepository } from "./iasync-repository";
import { IUsersRepository } from "./iusers-repository";
import { IRefreshTokensRepository } from "./irefresh-tokens-repository";

export interface IUnitOfWork {
  readonly usersRepository: IUsersRepository;
  readonly tasksRepository: IAsyncRepository<Task>;
  readonly refreshTokensRepository: IRefreshTokensRepository;

  /** Commits the current unit of work */
  saveChangesAsync(): Promise<number>;
  /** Executes a unit of work within a transaction */
  withTransaction<T>(work: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
  /** Disposes the unit of work, releasing any resources */
  dispose(): Promise<void>;
  /** Resets the unit of work to its initial state */
  reset(): Promise<void>;
}
