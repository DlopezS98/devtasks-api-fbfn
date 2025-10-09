import { PagedResult, Query } from "@Domain/core/query";

import BaseEntity, { BaseEntityProps } from "../../entities/base-entity";

export interface IAsyncRepository<TEntity extends BaseEntity, TProps extends BaseEntityProps> {
  addAsync(entity: TEntity): Promise<TEntity>;
  addAsync(entities: TEntity[]): Promise<TEntity[]>;
  getAsync(id: string): Promise<TEntity | null>;
  updateAsync(entity: TEntity): Promise<void>;
  updateAsync(entities: TEntity[]): Promise<void>;
  deleteAsync(entity: TEntity): Promise<void>;
  deleteAsync(entities: TEntity[]): Promise<void>;
  getAllAsync(): Promise<TEntity[]>;
  /**
   * Queries entities based on the provided query object.
   * Basic filtering by AND conditions only.
   * @param query The query object containing filtering, sorting, and pagination parameters.
   */
  queryAsync(query: Query<TProps>): Promise<PagedResult<TEntity>>;
}
