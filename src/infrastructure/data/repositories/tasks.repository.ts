import { ITasksRepository } from "@Domain/abstractions/repositories/itasks-repository";
import Task from "@Domain/entities/task.entity";
import TaskLabel from "@Domain/entities/task-label.entity";

import FactoryConverter from "../converters/factory-converter";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class TasksRepository extends FirestoreRepository<Task> implements ITasksRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => Task.empty());
  }

  override async addAsync(entity: Task): Promise<Task>;
  override async addAsync(entities: Task[]): Promise<Task[]>;
  override async addAsync(entities: Task | Task[]): Promise<Task | Task[]> {
    if (Array.isArray(entities)) {
      const results = await super.addAsync(entities);
      for (const entity of results) {
        if (entity.taskLabels.length > 0) {
          entity.taskLabels.forEach(this.addTaskLabel.bind(this, entity));
        }
      }
      return results;
    } else {
      const result = await super.addAsync(entities);
      if (result.taskLabels.length > 0) {
        result.taskLabels.forEach(this.addTaskLabel.bind(this, result));
      }
      return result;
    }
  }

  private addTaskLabel(entity: Task, label: TaskLabel): TaskLabel {
    label.id = this.collectionRef().doc(entity.id).collection("labels").doc().id;
    const labelRef = this.collectionRef()
      .doc(entity.id)
      .collection("labels")
      .doc(label.id)
      .withConverter(FactoryConverter.createConverter(TaskLabel.empty()));
    this.uow.set(labelRef, label);
    return label;
  }

  async getByUserAsync(userId: string): Promise<Task[]> {
    const querySnapshot = await this.collectionRef().where("userId", "==", userId).get();
    return querySnapshot.docs.map((doc) => doc.data());
  }
}
