export interface UpdateTaskRequestDto {
  title?: string;
  status?: string;
  description?: string;
  priority?: number;
  labelIds?: string[];
}
