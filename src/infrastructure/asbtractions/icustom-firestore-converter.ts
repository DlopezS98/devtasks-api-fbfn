import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";

export interface ICustomFirestoreConverter<TEntity extends BaseEntity, TProps extends BaseEntityProps>
  extends FirebaseFirestore.FirestoreDataConverter<TEntity> {
  /**
   * Converts a Task model to a plain object suitable for updates operations.
   * @param {TEntity} model The Task model to convert
   * @return {Partial<TProps>} The plain object representation of the Task model.
   */
  toUpdateObject(model: TEntity): Partial<TProps>;
}
