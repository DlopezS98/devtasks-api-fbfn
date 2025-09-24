/* eslint-disable require-jsdoc */
import User from "@Domain/entities/user.entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";
import FirestoreUtils from "../firestore.utils";

export default class UserConverter implements FirestoreDataConverter<User> {
  toFirestore(entity: User): FirebaseFirestore.DocumentData {
    return {
      email: entity.email,
      displayName: entity.displayName,
      passwordHash: entity.passwordHash,
      passwordSalt: entity.passwordSalt,
      isActive: entity.isActive,
      createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
      updatedAt: entity.updatedAt ? FirebaseFirestore.FieldValue.serverTimestamp() : null,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot) {
    const data = snapshot.data();
    return new User({
      id: snapshot.id,
      email: data.email,
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      passwordSalt: data.passwordSalt,
      isActive: data.isActive,
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) || new Date(0),
      updatedAt: FirestoreUtils.getDateFrom(data.updatedAt),
    });
  }
}
