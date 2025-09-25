import Task from "@Domain/entities/task.entity";

import { IAsyncRepository } from "./iasync-repository";

export interface ITasksRepository extends IAsyncRepository<Task> {
  getByUserAsync(userId: string): Promise<Task[]>;
}
