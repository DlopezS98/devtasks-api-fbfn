import { ITasksService } from "@Application/abstractions/itasks.service";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { ApiFilterParam, ApiSortParam, QueryDto } from "@Application/dtos/request/query.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";
import { UpdateTaskRequestDto } from "@Application/dtos/request/update-task.dto";
import { LabelResponseDto } from "@Application/dtos/response/label.dto";
import { TaskResponseDto } from "@Application/dtos/response/task.dto";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import { ComparisonOperator, FilterDescriptor, PagedResult, Pagination, Query, Sort } from "@Domain/core/query";
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

  async searchAsync(baseRequest: BaseRequestDto<QueryDto>): Promise<PagedResult<TaskResponseDto>> {
    const query: Query<Task> = {
      filters: this.parseFilters(baseRequest.data.filters),
      sorts: this.parseSorts(baseRequest.data.sorts),
      pagination: this.getPagination(baseRequest.data.page, baseRequest.data.pageSize),
    };
    const userFilter: FilterDescriptor<Task> = {
      field: "createdBy",
      operator: "eq",
      value: baseRequest.userId,
    };
    const isActiveFilter: FilterDescriptor<Task> = {
      field: "isActive",
      operator: "eq",
      value: true,
    };
    query.filters?.push(userFilter);
    query.filters?.push(isActiveFilter);
    const { items, totalCount, skip, take } = await this.unitOfWork.tasksRepository.queryAsync(query);
    return { items: items.map(this.mapTaskToDto), totalCount, skip, take };
  }

  private parseFilters(rawFilters: ApiFilterParam[]): FilterDescriptor<Task>[] {
    const filters: FilterDescriptor<Task>[] = rawFilters.map((f) => ({
      field: f.field as keyof Task,
      operator: f.operator as ComparisonOperator,
      value: f.value as Task[keyof Task],
    }));
    return filters;
  }

  private parseSorts(rawSorts: ApiSortParam[]): Sort<Task>[] {
    return rawSorts.map((s) => ({
      field: s.field as keyof Task,
      direction: s.direction as "asc" | "desc",
    }));
  }

  private getPagination(page: number, pageSize: number): Pagination {
    const take = pageSize;
    const skip = (page - 1) * pageSize;
    return { take, skip };
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

  async deleteAsync(taskId: string): Promise<void> {
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    // Soft delete by setting isActive to false
    task.isActive = false;
    await this.unitOfWork.tasksRepository.updateAsync(task);
    await this.unitOfWork.saveChangesAsync();
  }

  async updateAsync(taskId: string, request: BaseRequestDto<UpdateTaskRequestDto>): Promise<TaskResponseDto> {
    // TODO: Implement optimistic concurrency control
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    if (request.data.title !== undefined) task.title = request.data.title;
    if (request.data.description !== undefined) task.description = request.data.description;
    if (request.data.status !== undefined) {
      const status = TaskStatus.create(request.data.status);
      const canTransition = task.status.canTransitionTo(status);
      if (!canTransition) throw new DomainError("Invalid task status transition", ErrorCodes.CONFLICT);

      task.status = status;
    }
    if (request.data.priority !== undefined) task.priority = request.data.priority;

    await this.unitOfWork.tasksRepository.updateAsync(task);
    await this.unitOfWork.saveChangesAsync();
    const taskDto = this.mapTaskToDto(task);

    return taskDto;
  }
}
