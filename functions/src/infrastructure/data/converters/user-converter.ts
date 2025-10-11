import User, { UserProps } from "@Domain/entities/user.entity";
import * as admin from "firebase-admin";
import Email from "@Domain/value-objects/email";
import { ICustomFirestoreConverter } from "@Infrastructure/abstractions/icustom-firestore-converter";
import { UpdateData } from "firebase-admin/firestore";

import FirestoreUtils from "../firestore.utils";

export default class UserConverter implements ICustomFirestoreConverter<User, UserProps> {
  toUpdateObject(model: User): UpdateData<UserProps> {
    return {
      email: model.email.getValue(),
      displayName: model.displayName,
      passwordHash: model.passwordHash,
      passwordSalt: model.passwordSalt,
      isActive: model.isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
  }

  toFirestore(entity: User): FirebaseFirestore.DocumentData {
    return {
      email: entity.email.getValue(),
      displayName: entity.displayName,
      passwordHash: entity.passwordHash,
      passwordSalt: entity.passwordSalt,
      isActive: entity.isActive,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: null,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot) {
    const data = snapshot.data();
    return new User({
      id: snapshot.id,
      email: Email.create(data.email),
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      passwordSalt: data.passwordSalt,
      isActive: data.isActive,
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) || new Date(0),
      updatedAt: FirestoreUtils.getDateFrom(data.updatedAt),
    });
  }
}
