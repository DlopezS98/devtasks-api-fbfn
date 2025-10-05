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
import TaskLabel from "@Domain/entities/task-label.entity";
import Task, { TaskProps } from "@Domain/entities/task.entity";
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
    let labels: Label[] = [];
    if (labelIds.length > 0) {
      labels = await this.unitOfWork.labelsRepository.getByIdsAsync(labelIds, request.userId);
      if (labels.length !== labelIds.length) throw new Error("One or more labels not found");
    }

    labelIds.forEach(newTask.addTaskLabel.bind(newTask));

    await this.unitOfWork.tasksRepository.addAsync(newTask);
    await this.unitOfWork.saveChangesAsync();
    const taskDto = this.mapTaskToDto(newTask);
    taskDto.labels = labels.map(this.mapLabelToDto);
    return taskDto;
  }

  async getByIdAsync(taskId: string, userId: string): Promise<TaskResponseDto> {
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    const taskDto = this.mapTaskToDto(task);
    const labelIds = task.taskLabels.map((tl) => tl.labelId);
    if (labelIds.length > 0) {
      const labels = await this.unitOfWork.labelsRepository.getByIdsAsync(labelIds, userId);
      taskDto.labels = labels.map(this.mapLabelToDto);
    }
    return taskDto;
  }

  async addLabelAsync(taskId: string, labelId: string): Promise<void> {
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    const existingTaskLabel = task.taskLabels.find((tl) => tl.labelId === labelId);
    if (existingTaskLabel) throw new DomainError("Label is already associated with the task", ErrorCodes.CONFLICT);

    const label = await this.unitOfWork.labelsRepository.getAsync(labelId);
    if (!label) throw new EntityNotFoundError("Label");

    const newTaskLabel = TaskLabel.create(task.id, label.id);
    await this.unitOfWork.tasksRepository.addLabelAsync(newTaskLabel);
    await this.unitOfWork.saveChangesAsync();
  }

  async searchAsync(baseRequest: BaseRequestDto<QueryDto>): Promise<PagedResult<TaskResponseDto>> {
    const query: Query<TaskProps> = {
      filters: this.parseFilters(baseRequest.data.filters),
      sorts: this.parseSorts(baseRequest.data.sorts),
      pagination: this.getPagination(baseRequest.data.page, baseRequest.data.pageSize),
    };
    const userFilter: FilterDescriptor<TaskProps> = {
      field: "createdBy",
      operator: "eq",
      value: baseRequest.userId,
    };
    const isActiveFilter: FilterDescriptor<TaskProps> = {
      field: "isActive",
      operator: "eq",
      value: true,
    };
    query.filters?.push(userFilter);
    query.filters?.push(isActiveFilter);
    const { items, totalCount, skip, take } = await this.unitOfWork.tasksRepository.queryAsync(query);

    const taskDtos = await this.mapTasksWithLabels(items, baseRequest.userId);
    return { items: taskDtos, totalCount, skip, take };
  }

  /**
   * Maps tasks to their DTOs and attaches their labels efficiently.
   * @param {Task[]} tasks Array of Task entities
   * @param {string} userId The ID of the user for label filtering
   * @return {Promise<TaskResponseDto[]>} Array of TaskResponseDto with labels populated
   */
  private async mapTasksWithLabels(tasks: Task[], userId: string): Promise<TaskResponseDto[]> {
    const taskLabelMap = new Map<string, string[]>();
    const labelIdSet = new Set<string>();
    tasks.forEach((task) => {
      taskLabelMap.set(task.id, task.taskLabels.map((tl) => tl.labelId));
      task.taskLabels.forEach((tl) => labelIdSet.add(tl.labelId));
    });
    const labelIds = Array.from(labelIdSet);
    if (labelIds.length === 0) return tasks.map((task) => this.mapTaskToDto(task));

    const labels = await this.unitOfWork.labelsRepository.getByIdsAsync(labelIds, userId);
    const labelsMap = new Map(labels.map((label) => [label.id, this.mapLabelToDto(label)]));

    return tasks.map((item) => {
      const taskDto = this.mapTaskToDto(item);
      const labelDtos = taskLabelMap.get(item.id)?.map((labelId) => labelsMap.get(labelId)).filter(Boolean) || [];
      taskDto.labels = labelDtos as LabelResponseDto[];
      return taskDto;
    });
  }

  private parseFilters(rawFilters: ApiFilterParam[]): FilterDescriptor<TaskProps>[] {
    const filters: FilterDescriptor<TaskProps>[] = rawFilters.map((f) => ({
      field: f.field as keyof TaskProps,
      operator: f.operator as ComparisonOperator,
      value: f.value as TaskProps[keyof TaskProps],
    }));
    return filters;
  }

  private parseSorts(rawSorts: ApiSortParam[]): Sort<TaskProps>[] {
    return rawSorts.map((s) => ({
      field: s.field as keyof TaskProps,
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
      if (!status.equals(task.status)) {
        const canTransition = task.status.canTransitionTo(status);
        if (!canTransition) throw new DomainError("Invalid task status transition", ErrorCodes.CONFLICT);
        task.status = status;
      }

      if (status.isCompleted()) {
        task.completedAt = new Date();
      }
    }
    if (request.data.priority !== undefined) task.priority = request.data.priority;

    let labels: Label[] = [];
    if (request.data.labelIds !== undefined && request.data.labelIds.length > 0) {
      // determine which labels to add and which to remove
      const newLabelIds = request.data.labelIds;
      labels = await this.unitOfWork.labelsRepository.getByIdsAsync(newLabelIds, request.userId);
      if (labels.length !== newLabelIds.length) throw new Error("One or more labels not found");

      const currentLabelIds = task.taskLabels.map((tl) => tl.labelId);

      const labelsToAddIds = newLabelIds.filter((id) => !currentLabelIds.includes(id));
      const labelsToRemoveIds = currentLabelIds.filter((id) => !newLabelIds.includes(id));

      if (labelsToAddIds.length > 0) {
        const taskLabels = labelsToAddIds.map((labelId) => TaskLabel.create(task.id, labelId));
        await this.unitOfWork.tasksRepository.addLabelsAsync(taskLabels);
      }

      if (labelsToRemoveIds.length > 0) {
        const taskLabelsToRemove = task.taskLabels.filter((tl) => labelsToRemoveIds.includes(tl.labelId));
        await this.unitOfWork.tasksRepository.removeLabelsAsync(taskLabelsToRemove);
        // Update task entity to reflect removed labels
        labels = labels.filter((l) => !labelsToRemoveIds.includes(l.id));
      }
    }

    await this.unitOfWork.tasksRepository.updateAsync(task);
    await this.unitOfWork.saveChangesAsync();
    const taskDto = this.mapTaskToDto(task);

    // Attach labels to DTO
    taskDto.labels = labels.map(this.mapLabelToDto);

    return taskDto;
  }

  async removeLabelAsync(taskId: string, labelId: string): Promise<void> {
    const task = await this.unitOfWork.tasksRepository.getAsync(taskId);
    if (!task) throw new EntityNotFoundError("Task");

    const labelIndex = task.taskLabels.findIndex((tl) => tl.labelId === labelId);
    if (labelIndex === -1) throw new DomainError("Label is not associated with the task", ErrorCodes.NOT_FOUND);

    const taskLabel = task.taskLabels[labelIndex];
    await this.unitOfWork.tasksRepository.removeLabelAsync(taskLabel);
    await this.unitOfWork.saveChangesAsync();
  }
}
