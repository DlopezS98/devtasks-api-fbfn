import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";
import { TaskResponseDto } from "@Application/dtos/response/task.dto";

export interface ITasksService {
  createAsync(request: BaseRequestDto<CreateTaskRequestDto>): Promise<TaskResponseDto>;
}
