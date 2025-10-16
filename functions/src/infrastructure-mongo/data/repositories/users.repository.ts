import { IUsersRepository } from "@Domain/abstractions/repositories/iusers-repository";
import User, { UserProps } from "@Domain/entities/user.entity";
import Email from "@Domain/value-objects/email";

import FactoryMapper from "../mapper/factory-mapper";
import { IMongoContext } from "../mongo.context";

import MongoRepository from "./mongo.repository";
import UnitOfWork from "./unit-of-work";

export default class UsersRepository extends MongoRepository<User, UserProps> implements IUsersRepository {
  constructor(context: IMongoContext, uow?: UnitOfWork) {
    super(context, User.empty, FactoryMapper.createMapper(User.empty()), uow);
  }

  async getByEmailAsync(email: string): Promise<User | null> {
    const collection = this.getCollection();
    // force type casting since MongoDB does not support custom types the email value is stored as string
    const document = await collection.findOne({ email: email as unknown as Email });
    return document ? this.mapper.fromDocument(document) : null;
  }
}
