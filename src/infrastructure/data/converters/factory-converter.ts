/* eslint-disable indent */
import BaseEntity from "@Domain/entities/base-entity";
import TaskConverter from "./task-converter";
import { FirestoreDataConverter } from "firebase-admin/firestore";

/* eslint-disable require-jsdoc */
export default class FactoryConverter {
  public static createConverter<TEntity extends BaseEntity>(entity: TEntity): FirestoreDataConverter<TEntity> {
    switch (entity.namespace) {
      case "Tasks": return new TaskConverter() as unknown as FirestoreDataConverter<TEntity>;
      case "Users": throw new Error("UserConverter not implemented yet");
      default: throw new Error(`No converter found for entity namespace: ${entity.namespace}`);
    }
  }
}
