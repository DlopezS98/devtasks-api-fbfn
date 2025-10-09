import Task, { TaskProps } from "@Domain/entities/task.entity";
import TaskLabel from "@Domain/entities/task-label.entity";

import { IAsyncRepository } from "./iasync-repository";

export interface ITasksRepository extends IAsyncRepository<Task, TaskProps> {
  getByUserAsync(userId: string): Promise<Task[]>;
  addLabelAsync(label: TaskLabel): Promise<void>;
  addLabelsAsync(labels: TaskLabel[]): Promise<void>;
  removeLabelAsync(label: TaskLabel): Promise<void>;
  removeLabelsAsync(labels: TaskLabel[]): Promise<void>;
}
