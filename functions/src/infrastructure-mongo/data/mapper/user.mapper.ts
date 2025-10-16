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
    this.toPartialDocument = this.toPartialDocument.bind(this);
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

  toPartialDocument(entity: User): Partial<MongoDocument<UserProps>> {
    const pUser: Partial<MongoDocument<UserProps>> = {};

    if (entity.displayName !== undefined) pUser.displayName = entity.displayName;
    if (entity.email !== undefined) pUser.email = entity.email.toString() as unknown as Email;
    if (entity.passwordHash !== undefined) pUser.passwordHash = entity.passwordHash;
    if (entity.passwordSalt !== undefined) pUser.passwordSalt = entity.passwordSalt;
    if (entity.createdAt !== undefined) pUser.createdAt = entity.createdAt;
    if (entity.updatedAt !== undefined) pUser.updatedAt = entity.updatedAt;
    if (entity.isActive !== undefined) pUser.isActive = entity.isActive;

    return pUser;
  }
}
