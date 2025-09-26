import RefreshToken, { RefreshTokenProps } from "@Domain/entities/refresh-token.entity";
import * as admin from "firebase-admin";
import { ICustomFirestoreConverter } from "@Infrastructure/asbtractions/icustom-firestore-converter";
import { UpdateData } from "firebase-admin/firestore";

import FirestoreUtils from "../firestore.utils";

/* eslint-disable require-jsdoc */
export default class RefreshTokenConverter implements ICustomFirestoreConverter<RefreshToken, RefreshTokenProps> {
  toUpdateObject(model: RefreshToken): UpdateData<RefreshTokenProps> {
    return {
      userId: model.userId,
      tokenHash: model.tokenHash,
      expiresAt: model.expiresAt,
      createdAt: model.createdAt,
      revokedAt: model.revokedAt,
      createdByIp: model.createdByIp,
      userAgent: model.userAgent,
      deviceName: model.deviceName,
    };
  }

  toFirestore(entity: RefreshToken): FirebaseFirestore.DocumentData {
    return {
      userId: entity.userId,
      tokenHash: entity.tokenHash,
      createdByIp: entity.createdByIp,
      userAgent: entity.userAgent,
      deviceName: entity.deviceName,
      revokedAt: entity.revokedAt ? admin.firestore.FieldValue.serverTimestamp() : null,
      expiresAt: entity.expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot) {
    const data = snapshot.data();
    return new RefreshToken({
      id: snapshot.id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      createdByIp: data.createdByIp,
      userAgent: data.userAgent,
      deviceName: data.deviceName,
      revokedAt: FirestoreUtils.getDateFrom(data.revokedAt),
      expiresAt: FirestoreUtils.getDateFrom(data.expiresAt) || new Date(0),
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) || new Date(0),
    });
  }
}
