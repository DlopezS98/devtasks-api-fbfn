import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { QueryDto } from "@Application/dtos/request/query.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";
import { TaskResponseDto } from "@Application/dtos/response/task.dto";
import { PagedResult } from "@Domain/core/query";

export interface ITasksService {
  searchAsync(baseRequest: BaseRequestDto<QueryDto>): Promise<PagedResult<TaskResponseDto>>;
  createAsync(request: BaseRequestDto<CreateTaskRequestDto>): Promise<TaskResponseDto>;
  addLabelAsync(taskId: string, labelId: string): Promise<void>;
}
