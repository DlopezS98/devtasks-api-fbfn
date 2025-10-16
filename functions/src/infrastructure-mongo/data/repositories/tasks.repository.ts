import { ITasksRepository } from "@Domain/abstractions/repositories/itasks-repository";
import Task, { TaskProps } from "@Domain/entities/task.entity";
import TaskLabel from "@Domain/entities/task-label.entity";

import { IMongoContext } from "../mongo.context";
import FactoryMapper from "../mapper/factory-mapper";

import MongoRepository from "./mongo.repository";
import UnitOfWork from "./unit-of-work";

export default class TasksRepository extends MongoRepository<Task, TaskProps> implements ITasksRepository {
  constructor(context: IMongoContext, uow?: UnitOfWork) {
    super(context, Task.empty, FactoryMapper.createMapper(Task.empty()), uow);
  }

  getByUserAsync(userId: string): Promise<Task[]> {
    throw new Error("Method not implemented.");
  }

  addLabelAsync(label: TaskLabel): Promise<void> {
    throw new Error("Method not implemented.");
  }

  addLabelsAsync(labels: TaskLabel[]): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeLabelAsync(label: TaskLabel): Promise<void> {
    throw new Error("Method not implemented.");
  }

  removeLabelsAsync(labels: TaskLabel[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
