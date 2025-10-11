import * as admin from "firebase-admin";
import Label, { LabelProps } from "@Domain/entities/labels.entity";
import { ICustomFirestoreConverter } from "@Infrastructure/abstractions/icustom-firestore-converter";
import { UpdateData } from "firebase-admin/firestore";

import FirestoreUtils from "../firestore.utils";

export default class LabelConverter implements ICustomFirestoreConverter<Label, LabelProps> {
  toUpdateObject(model: Label): UpdateData<LabelProps> {
    return {
      name: model.name,
      normalizedName: model.normalizedName.getValue(),
      color: model.color,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as unknown as Date,
      isActive: model.isActive,
    };
  }

  toFirestore(entity: Label): FirebaseFirestore.DocumentData {
    return {
      name: entity.name,
      normalizedName: entity.normalizedName.getValue(),
      color: entity.color,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: null,
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
