/* eslint-disable require-jsdoc */
import Task from "@Domain/entities/task.entity";
import { FirestoreDataConverter } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import TaskLabel from "@Domain/entities/task-label.entity";

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
      createdBy: model.createdBy,
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
      createdBy: data.createdBy,
    });
  }
}

export class TaskLabelConverter implements FirestoreDataConverter<TaskLabel> {
  toFirestore(model: TaskLabel): FirebaseFirestore.DocumentData {
    return {
      labelId: model.labelId,
      taskId: model.taskId,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): TaskLabel {
    const data = snapshot.data();
    return new TaskLabel({
      id: snapshot.id,
      labelId: data.labelId,
      taskId: data.taskId,
    });
  }
}
