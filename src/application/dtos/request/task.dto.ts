export interface CreateTaskRequestDto {
  title: string;
  status: string;
  description: string;
  priority: number;
  labelIds: string[];
}
