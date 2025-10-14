import BaseEntity, { BaseEntityProps } from "@Domain/entities/base-entity";
import BaseMapper from "@Infrastructure/Mongo/abstractions/base-mapper";

import UserMapper from "./user.mapper";

export default class FactoryMapper {
  static createMapper<TEntity extends BaseEntity, TProps extends BaseEntityProps>(
    entity: TEntity,
  ): BaseMapper<TEntity, TProps> {
    switch (entity.namespace) {
      case "users":
        return new UserMapper() as unknown as BaseMapper<TEntity, TProps>;
      default:
        throw new Error(`No mapper found for namespace: ${entity.namespace}`);
    }
  }
}
