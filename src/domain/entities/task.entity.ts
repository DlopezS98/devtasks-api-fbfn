import TaskStatus, { TaskStatuses } from "../value-objects/task-status";

import BaseEntity, { BaseEntityProps } from "./base-entity";
import TaskLabel from "./task-label.entity";

export interface TaskProps extends BaseEntityProps {
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  taskLabels: TaskLabel[];
  priority: number;
  createdBy: string;
  isActive: boolean;
}

export default class Task extends BaseEntity implements TaskProps {
  public get namespace(): string {
    return "Tasks";
  }

  title = "";
  description = "";
  status!: TaskStatus;
  createdAt!: Date;
  updatedAt: Date | null = null;
  completedAt: Date | null = null;
  priority = 0;
  createdBy = "";
  isActive = true;

  get taskLabels() {
    return this._taskLabels;
  }
  private _taskLabels: TaskLabel[] = [];

  constructor(props: Omit<TaskProps, "taskLabels" | "namespace">) {
    super(props.id);
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.completedAt = props.completedAt;
    this.priority = props.priority;
    this.createdBy = props.createdBy;
    this.isActive = props.isActive;
  }


  addTaskLabel(label: TaskLabel | string): void {
    let taskLabel: TaskLabel;
    if (typeof label === "string") {
      taskLabel = new TaskLabel({
        id: "", // entity generated value
        taskId: this.id,
        labelId: label,
      });
    } else if (label instanceof TaskLabel) {
      taskLabel = new TaskLabel({
        id: label.id,
        taskId: this.id,
        labelId: label.id,
      });
    } else {
      throw new Error("Invalid label type");
    }

    this._taskLabels.push(taskLabel);
  }

  static empty(): Task {
    return new Task({
      id: "",
      title: "",
      description: "",
      status: TaskStatus.create(TaskStatuses.Draft),
      createdAt: new Date(),
      updatedAt: null,
      completedAt: null,
      priority: 0,
      createdBy: "",
      isActive: false,
    });
  }

  static create(props: Pick<TaskProps, "title" | "description" | "status" | "priority" | "createdBy">): Task {
    return new Task({
      id: "", // entity generated value
      title: props.title,
      description: props.description,
      status: props.status,
      createdAt: new Date(), // placeholder, should be set by repository
      updatedAt: null,
      completedAt: null,
      priority: props.priority,
      createdBy: props.createdBy,
      isActive: true,
    });
  }
}
