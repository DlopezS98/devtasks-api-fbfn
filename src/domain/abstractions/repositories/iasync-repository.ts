import BaseEntity from "../../entities/base-entity";

export interface IAsyncRepository<TEntity extends BaseEntity> {
  addAsync(entity: TEntity): Promise<TEntity>;
  addAsync(entities: TEntity[]): Promise<TEntity[]>;
  getAsync(id: string): Promise<TEntity | null>;
  updateAsync(entity: TEntity): Promise<void>;
  updateAsync(entities: TEntity[]): Promise<void>;
  deleteAsync(entity: TEntity): Promise<void>;
  deleteAsync(entities: TEntity[]): Promise<void>;
  getAllAsync(): Promise<TEntity[]>;
}
