import { IUsersRepository } from "@Domain/abstractions/repositories/iusers-repository";
import User, { UserProps } from "@Domain/entities/user.entity";

import { IMongoContext } from "../mongo.context";

import MongoRepository from "./mongo.repository";
import UnitOfWork from "./unit-of-work";

export default class UsersRepository extends MongoRepository<User, UserProps> implements IUsersRepository {
  constructor(context: IMongoContext, uow?: UnitOfWork) {
    super(context, User.empty, uow);
  }

  getByEmailAsync(email: string): Promise<User | null> {
    throw new Error("Method not implemented.");
  }
}
