/* eslint-disable require-jsdoc */
import Task from "@Domain/entities/task.entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

import FirestoreUtils from "../firestore.utils";

export default class TaskConverter implements FirestoreDataConverter<Task> {
  toFirestore(model: Task): FirebaseFirestore.DocumentData {
    return {
      title: model.title,
      description: model.description,
      status: model.status,
      priority: model.priority,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: model.updatedAt ? admin.firestore.FieldValue.serverTimestamp() : null,
      completedAt: model.completedAt ? admin.firestore.FieldValue.serverTimestamp() : null,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Task {
    const data = snapshot.data();
    return new Task({
      id: snapshot.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) ?? new Date(0),
      updatedAt: FirestoreUtils.getDateFrom(data.updatedAt),
      completedAt: FirestoreUtils.getDateFrom(data.completedAt),
    });
  }
}
