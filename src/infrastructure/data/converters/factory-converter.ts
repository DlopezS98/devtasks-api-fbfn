/* eslint-disable indent */
import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";
import { ICustomFirestoreConverter } from "@Infrastructure/asbtractions/icustom-firestore-converter";

import TaskConverter, { TaskLabelConverter } from "./task-converter";
import UserConverter from "./user-converter";
import RefreshTokenConverter from "./refresh-token-converter";
import LabelConverter from "./label-converter";

export default class FactoryConverter {
  public static createConverter<TEntity extends BaseEntity, TProps extends BaseEntityProps>(
    entity: TEntity,
  ): ICustomFirestoreConverter<TEntity, TProps> {
    switch (entity.namespace) {
      case "Tasks":
        return new TaskConverter() as unknown as ICustomFirestoreConverter<TEntity, TProps>;
      case "Users":
        return new UserConverter() as unknown as ICustomFirestoreConverter<TEntity, TProps>;
      case "RefreshTokens":
        return new RefreshTokenConverter() as unknown as ICustomFirestoreConverter<TEntity, TProps>;
      case "Labels":
        return new LabelConverter() as unknown as ICustomFirestoreConverter<TEntity, TProps>;
      case "TaskLabels":
        return new TaskLabelConverter() as unknown as ICustomFirestoreConverter<TEntity, TProps>;
      default:
        throw new Error(`No converter found for entity namespace: ${entity.namespace}`);
    }
  }
}
