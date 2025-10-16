import { BSON, OptionalUnlessRequiredId, WithId } from "mongodb";
import User, { UserProps } from "@Domain/entities/user.entity";
import BaseMapper from "@Infrastructure/Mongo/abstractions/base-mapper";
import { MongoDocument } from "@Infrastructure/Mongo/models/mongo-document";

export default class UserMapper extends BaseMapper<User, UserProps> {
  override toDocument(user: User): OptionalUnlessRequiredId<MongoDocument<UserProps>> {
    return {
      _id: new BSON.ObjectId(),
      displayName: user.displayName,
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
    };
  }

  override fromDocument(doc: WithId<MongoDocument<UserProps>>): User
  override fromDocument(doc: OptionalUnlessRequiredId<MongoDocument<UserProps>>): User {
    const id = !doc._id ? "" : doc._id.toHexString();

    return new User({
      id,
      displayName: doc.displayName,
      email: doc.email,
      passwordHash: doc.passwordHash,
      passwordSalt: doc.passwordSalt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      isActive: doc.isActive,
    });
  }
}
