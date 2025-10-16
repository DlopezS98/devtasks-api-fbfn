import { BaseEntityProps } from "@Domain/entities/base-entity";

export type MongoDocument<TProps extends BaseEntityProps> = Omit<TProps, "id">;
