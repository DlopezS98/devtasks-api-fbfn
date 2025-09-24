/* eslint-disable require-jsdoc */
import BaseEntity from "./base-entity";

export interface ITaskLabelProps {
  id: string;
  taskId: string;
  labelId: string;
}

export default class TaskLabel extends BaseEntity implements ITaskLabelProps {
  taskId: string;
  labelId: string;
  constructor(props: ITaskLabelProps) {
    super(props.id);
    this.taskId = props.taskId;
    this.labelId = props.labelId;
  }
}
