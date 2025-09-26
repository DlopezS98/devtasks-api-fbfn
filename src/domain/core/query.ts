export interface PagedResult<T> {
  items: T[];
  skip: number;
  take: number;
  totalCount: number;
}

export interface Pagination {
  skip: number | null;
  take: number | null;
}

export interface Sort<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

export type ComparisonOperator = "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "nin" | "contains";

export interface FilterDescriptor<TCandidate> {
  field: keyof TCandidate;
  operator: ComparisonOperator;
  value: TCandidate[keyof TCandidate] | TCandidate[keyof TCandidate][];
}

export interface Query<TCandidate> {
  filter?: FilterDescriptor<TCandidate>[];
  sort?: Sort<TCandidate>[];
  pagination?: Pagination;
}
