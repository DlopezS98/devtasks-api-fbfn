import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { LabelRequestDto } from "@Application/dtos/request/label.dto";
import { LabelResponseDto } from "@Application/dtos/response/label.dto";

export interface ILabelsService {
  listAsync(): Promise<LabelResponseDto[]>;
  AddAsync(request: BaseRequestDto<LabelRequestDto>): Promise<LabelResponseDto>;
  DeleteAsync(id: string): Promise<void>;
}
