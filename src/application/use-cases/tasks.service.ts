import { ITasksService } from "@Application/abstractions/itasks.service";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";
import { LabelResponseDto } from "@Application/dtos/response/label.dto";
import { TaskResponseDto } from "@Application/dtos/response/task.dto";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import Label from "@Domain/entities/labels.entity";
import Task from "@Domain/entities/task.entity";
import DomainError, { ErrorCodes } from "@Domain/errors/domain-error";
import EntityNotFoundError from "@Domain/errors/entity-not-found.error";
import { SERVICE_IDENTIFIERS } from "@Domain/service-identifiers";
import TaskStatus from "@Domain/value-objects/task-status";
import { inject, injectable } from "inversify";

@injectable()
export default class TasksService implements ITasksService {
  constructor(@inject(SERVICE_IDENTIFIERS.IUnitOfWork) private readonly unitOfWork: IUnitOfWork) {}

  async createAsync(request: BaseRequestDto<CreateTaskRequestDto>): Promise<TaskResponseDto> {
    const newTask = Task.create({
      title: request.data.title,
      description: request.data.description,
      status: TaskStatus.create(request.data.status),
      priority: request.data.priority ?? 0,
      createdBy: request.userId,
    });
    const labelIds = request.data.labelIds ?? [];
    const labels = await this.unitOfWork.labelsRepository.getByIdsAsync(labelIds);
    if (labels.length !== labelIds.length) throw new Error("One or more labels not found");

    labelIds.forEach(newTask.addTaskLabel.bind(newTask));

    await this.unitOfWork.tasksRepository.addAsync(newTask);
    await this.unitOfWork.saveChangesAsync();
    const taskDto = this.mapTaskToDto(newTask);
    taskDto.labels = labels.map(this.mapLabelToDto);
    return taskDto;
  }

  async addLabelAsync(taskId: string, labelId: string): Promise<void> {
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    const existingTaskLabel = task.taskLabels.find((tl) => tl.labelId === labelId);
    if (existingTaskLabel) throw new DomainError("Label is already associated with the task", ErrorCodes.CONFLICT);

    const label = await this.unitOfWork.labelsRepository.getAsync(labelId);
    if (!label) throw new EntityNotFoundError("Label");

    await this.unitOfWork.saveChangesAsync();
  }

  private mapTaskToDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status.getValue(),
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      labels: [],
    };
  }

  private mapLabelToDto(label: Label): LabelResponseDto {
    return {
      id: label.id,
      name: label.name,
      color: label.color,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
    };
  }
}
