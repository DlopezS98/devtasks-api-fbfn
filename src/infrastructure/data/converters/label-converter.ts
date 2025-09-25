import * as admin from "firebase-admin";
import Label from "@Domain/entities/labels.entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";

import FirestoreUtils from "../firestore.utils";

export default class LabelConverter implements FirestoreDataConverter<Label> {
  toFirestore(entity: Label): FirebaseFirestore.DocumentData {
    return {
      name: entity.name,
      color: entity.color,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: entity.updatedAt ? admin.firestore.FieldValue.serverTimestamp() : null,
      createdBy: entity.createdBy,
      isActive: entity.isActive,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Label {
    const data = snapshot.data();
    return new Label({
      id: snapshot.id,
      name: data.name,
      color: data.color,
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) ?? new Date(0),
      updatedAt: FirestoreUtils.getDateFrom(data.updatedAt),
      createdBy: data.createdBy,
      isActive: data.isActive,
    });
  }
}
