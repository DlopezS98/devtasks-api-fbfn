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

export const OperatorSchema = ["eq", "ne", "gt", "lt", "gte", "lte", "in", "nin", "contains"] as const;
export type ComparisonOperator = (typeof OperatorSchema)[number];

export interface FilterDescriptor<TCandidate> {
  field: keyof TCandidate;
  operator: ComparisonOperator;
  value: TCandidate[keyof TCandidate] | TCandidate[keyof TCandidate][];
}

export interface Query<TCandidate> {
  filters?: FilterDescriptor<TCandidate>[];
  sort?: Sort<TCandidate>[];
  pagination?: Pagination;
}
