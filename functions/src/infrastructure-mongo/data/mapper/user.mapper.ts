import { BSON, OptionalUnlessRequiredId, WithId } from "mongodb";
import User, { UserProps } from "@Domain/entities/user.entity";
import BaseMapper from "@Infrastructure/Mongo/abstractions/base-mapper";
import { MongoDocument } from "@Infrastructure/Mongo/models/mongo-document";
import Email from "@Domain/value-objects/email";

export default class UserMapper extends BaseMapper<User, UserProps> {
  constructor() {
    super();
    this.fromDocument = this.fromDocument.bind(this);
    this.toDocument = this.toDocument.bind(this);
  }

  override toDocument(user: User): OptionalUnlessRequiredId<MongoDocument<UserProps>> {
    return {
      _id: new BSON.ObjectId(),
      displayName: user.displayName,
      // force type casting since MongoDB does not support custom types
      email: user.email.toString() as unknown as Email,
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
    const createdAt = this.toDate(doc.createdAt);
    if (!createdAt) throw new Error("Invalid createdAt date");

    return new User({
      id,
      displayName: doc.displayName,
      email: Email.create(doc.email as unknown as string),
      passwordHash: doc.passwordHash,
      passwordSalt: doc.passwordSalt,
      createdAt,
      updatedAt: this.toDate(doc.updatedAt),
      isActive: doc.isActive,
    });
  }
}
