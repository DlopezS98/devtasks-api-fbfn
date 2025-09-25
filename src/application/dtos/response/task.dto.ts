import { LabelResponseDto } from "./label.dto";

export interface TaskResponseDto {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date | null;
  completedAt: Date | null;
  labels: LabelResponseDto[];
  priority: number;
}
