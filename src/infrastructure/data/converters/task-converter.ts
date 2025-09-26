/* eslint-disable require-jsdoc */
import Task, { TaskProps } from "@Domain/entities/task.entity";
import { FirestoreDataConverter, UpdateData } from "firebase-admin/firestore";
import * as admin from "firebase-admin";
import TaskLabel from "@Domain/entities/task-label.entity";
import TaskStatus from "@Domain/value-objects/task-status";
import { ICustomFirestoreConverter } from "@Infrastructure/asbtractions/icustom-firestore-converter";

import FirestoreUtils from "../firestore.utils";

export default class TaskConverter implements ICustomFirestoreConverter<Task, TaskProps> {
  toUpdateObject(model: Task): UpdateData<TaskProps> {
    return {
      id: model.id,
      title: model.title,
      description: model.description,
      status: model.status.getValue(),
      priority: model.priority,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: model.completedAt,
      createdBy: model.createdBy,
      isActive: model.isActive,
    };
  }

  toFirestore(model: Task): FirebaseFirestore.DocumentData {
    return {
      title: model.title,
      description: model.description,
      status: model.status.getValue(),
      priority: model.priority,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: null,
      completedAt: model.completedAt ? admin.firestore.FieldValue.serverTimestamp() : null,
      createdBy: model.createdBy,
      isActive: model.isActive,
    };
  }

  fromFirestore(snapshot: FirebaseFirestore.QueryDocumentSnapshot): Task {
    const data = snapshot.data();
    return new Task({
      id: snapshot.id,
      title: data.title,
      description: data.description,
      status: TaskStatus.create(data.status),
      priority: data.priority,
      createdAt: FirestoreUtils.getDateFrom(data.createdAt) ?? new Date(0),
      updatedAt: FirestoreUtils.getDateFrom(data.updatedAt),
      completedAt: FirestoreUtils.getDateFrom(data.completedAt),
      createdBy: data.createdBy,
      isActive: data.isActive ?? false,
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
