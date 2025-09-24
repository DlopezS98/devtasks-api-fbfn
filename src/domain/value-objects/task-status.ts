/* eslint-disable require-jsdoc */

import DomainError, { ErrorCodes } from "../errors/domain-error";
import ValueObject from "./value-object";


export enum TaskStatuses {
  Draft = "Draft",
  ToDo = "ToDo",
  InProgress = "InProgress",
  Done = "Done",
}

interface TaskStatusProps {
  value: TaskStatuses;
}

export default class TaskStatus extends ValueObject<TaskStatusProps> {
  private constructor(status: TaskStatuses) {
    super({ value: status });
  }

  /**
   * Factory method to create a TaskStatus value object.
   * @param {TaskStatuses} status The status to create the TaskStatus value object.
   * @return {TaskStatus} An instance of the TaskStatus value object.
   */
  public static create(status: TaskStatuses): TaskStatus {
    if (!Object.values(TaskStatuses).includes(status)) {
      throw new DomainError(`Invalid task status: ${status}`, ErrorCodes.INVALID_TASK_STATUS);
    }

    return new TaskStatus(status);
  }

  /**
   * Get the task status value.
   * @return {TaskStatuses} The task status.
   */
  public getValue(): TaskStatuses {
    return this.props.value;
  }

  /**
   * Return the task status as a string.
   * @return {string} The task status string.
   */
  public toString(): string {
    return this.props.value;
  }

  // Domain-specific methods
  public isCompleted = (): boolean => this.props.value === TaskStatuses.Done;
  public isInProgress = (): boolean => this.props.value === TaskStatuses.InProgress;
  public isToDo = (): boolean => this.props.value === TaskStatuses.ToDo;
  public isDraft = (): boolean => this.props.value === TaskStatuses.Draft;

  /**
   * Check if a transition to a new status is valid.
   * @param {TaskStatuses} newStatus The new status to transition to.
   * @return {Boolean} True if the transition is valid, otherwise false.
   */
  public canTransitionTo = (newStatus: TaskStatuses): boolean => {
    const transitions: Record<TaskStatuses, TaskStatuses[]> = {
      [TaskStatuses.Draft]: [TaskStatuses.ToDo],
      [TaskStatuses.ToDo]: [TaskStatuses.InProgress, TaskStatuses.Done],
      [TaskStatuses.InProgress]: [TaskStatuses.Done, TaskStatuses.ToDo],
      [TaskStatuses.Done]: [TaskStatuses.InProgress],
    };

    return transitions[this.props.value].includes(newStatus);
  };
}
