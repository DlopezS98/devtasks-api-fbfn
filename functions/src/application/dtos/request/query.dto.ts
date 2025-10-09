export interface ApiFilterParam {
  raw: string;
  field: string;
  operator: string;
  value: string | number | boolean;
}

export interface ApiSortParam {
  field: string;
  direction: "asc" | "desc";
}

export interface QueryDto {
  filters: ApiFilterParam[];
  sorts: ApiSortParam[];
  page: number;
  pageSize: number;
}
