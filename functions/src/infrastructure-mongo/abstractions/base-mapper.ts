import { OptionalUnlessRequiredId, WithId } from "mongodb";
import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";

import { MongoDocument } from "../models/mongo-document";

export default abstract class BaseMapper<TEntity extends BaseEntity, TProps extends BaseEntityProps> {
  abstract toDocument(entity: TEntity): OptionalUnlessRequiredId<MongoDocument<TProps>>;
  abstract fromDocument(doc: OptionalUnlessRequiredId<MongoDocument<TProps>>): TEntity;
  abstract fromDocument(doc: WithId<MongoDocument<TProps>>): TEntity;

  protected toDate(date: unknown): Date | null {
    if (date instanceof Date) return date;

    if (typeof date === "string" || typeof date === "number") {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) ? parsedDate : null;
    }

    return null;
  }
}
