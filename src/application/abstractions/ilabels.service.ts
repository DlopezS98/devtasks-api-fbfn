import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { LabelRequestDto } from "@Application/dtos/request/label.dto";
import { LabelResponseDto } from "@Application/dtos/response/label.dto";

export interface ILabelsService {
  listAsync(userId: string): Promise<LabelResponseDto[]>;
  addAsync(request: BaseRequestDto<LabelRequestDto>): Promise<LabelResponseDto>;
  deleteAsync(id: string): Promise<void>;
}
