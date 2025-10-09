export interface BaseRequestDto<TData> {
  userId: string;
  data: TData;
}
