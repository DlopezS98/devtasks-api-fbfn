/* eslint-disable indent */
import BaseEntity from "@Domain/entities/base-entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";

import TaskConverter from "./task-converter";
import UserConverter from "./user-converter";
import RefreshTokenConverter from "./refresh-token-converter";

/* eslint-disable require-jsdoc */
export default class FactoryConverter {
  public static createConverter<TEntity extends BaseEntity>(entity: TEntity): FirestoreDataConverter<TEntity> {
    switch (entity.namespace) {
      case "Tasks": return new TaskConverter() as unknown as FirestoreDataConverter<TEntity>;
      case "Users": return new UserConverter() as unknown as FirestoreDataConverter<TEntity>;
      case "RefreshTokens": return new RefreshTokenConverter() as unknown as FirestoreDataConverter<TEntity>;
      default: throw new Error(`No converter found for entity namespace: ${entity.namespace}`);
    }
  }
}
