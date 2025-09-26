import User from "@Domain/entities/user.entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import Email from "@Domain/value-objects/email";

import FirestoreUtils from "../firestore.utils";

export default class UserConverter implements FirestoreDataConverter<User> {
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
