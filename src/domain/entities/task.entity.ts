/* eslint-disable require-jsdoc */

import TaskStatus from "../value-objects/task-status";
import BaseEntity from "./base-entity";
import TaskLabel from "./task-label.entity";

export interface ITaskProps {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  taskLabels: TaskLabel[];
  priority: number;
}

export default class Task extends BaseEntity implements ITaskProps {
  title = "";
  description = "";
  status!: TaskStatus;
  createdAt!: Date;
  updatedAt: Date | null = null;
  completedAt: Date | null = null;
  priority = 0;

  get taskLabels() {
    return this._taskLabels;
  }
  private _taskLabels: TaskLabel[] = [];

  constructor(props: Omit<ITaskProps, "taskLabels">) {
    super(props.id);
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.completedAt = props.completedAt;
  }

  addLabel(labelId: string) {
    const taskLabel = new TaskLabel({
      id: "", // entity generated value
      taskId: this.id,
      labelId,
    });
    this._taskLabels.push(taskLabel);
  }
}
