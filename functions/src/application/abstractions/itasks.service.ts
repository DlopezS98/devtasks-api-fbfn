import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { QueryDto } from "@Application/dtos/request/query.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";
import { UpdateTaskRequestDto } from "@Application/dtos/request/update-task.dto";
import { TaskResponseDto } from "@Application/dtos/response/task.dto";
import { PagedResult } from "@Domain/core/query";

export interface ITasksService {
  searchAsync(baseRequest: BaseRequestDto<QueryDto>): Promise<PagedResult<TaskResponseDto>>;
  createAsync(request: BaseRequestDto<CreateTaskRequestDto>): Promise<TaskResponseDto>;
  addLabelAsync(taskId: string, labelId: string): Promise<void>;
  removeLabelAsync(taskId: string, labelId: string): Promise<void>;
  getByIdAsync(taskId: string, userId: string): Promise<TaskResponseDto>;
  deleteAsync(taskId: string): Promise<void>;
  updateAsync(taskId: string, request: BaseRequestDto<UpdateTaskRequestDto>): Promise<TaskResponseDto>;
}
