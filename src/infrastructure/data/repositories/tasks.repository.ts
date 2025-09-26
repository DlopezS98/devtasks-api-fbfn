import { ITasksRepository } from "@Domain/abstractions/repositories/itasks-repository";
import Task, { TaskProps } from "@Domain/entities/task.entity";
import TaskLabel from "@Domain/entities/task-label.entity";

import FactoryConverter from "../converters/factory-converter";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class TasksRepository extends FirestoreRepository<Task, TaskProps> implements ITasksRepository {
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
    label.id = this.getTaskLabelCollectionRef(entity.id).doc().id;
    const labelRef = this.getTaskLabelCollectionRef(entity.id).doc(label.id);
    this.uow.set(labelRef, label);
    return label;
  }

  async getByUserAsync(userId: string): Promise<Task[]> {
    const querySnapshot = await this.collectionRef()
      .where("userId", "==", userId)
      .where("isActive", "==", true)
      .get();

    if (querySnapshot.empty) return [];

    const tasks = querySnapshot.docs.map((doc) => doc.data());
    const taskIds = tasks.map((t) => t.id);

    // Fetch labels for each task in parallel
    await Promise.all(
      tasks.map(async (task, idx) => {
        const labelSnapshot = await this.getTaskLabelCollectionRef(taskIds[idx]).get();
        labelSnapshot.docs.forEach((doc) => task.addTaskLabel(doc.data()));
      })
    );

    return tasks;
  }

  override async getAsync(id: string): Promise<Task | null> {
    const task = await super.getAsync(id);
    if (!task) return null;

    const labelSnapshot = await this.getTaskLabelCollectionRef(id).get();
    labelSnapshot.docs.forEach((doc) => task.addTaskLabel(doc.data()));
    return task;
  }

  addLabelAsync(label: TaskLabel): Promise<void> {
    label.id = this.getTaskLabelCollectionRef(label.taskId).doc().id;
    const labelRef = this.getTaskLabelCollectionRef(label.taskId).doc(label.id);
    this.uow.set(labelRef, label);
    return Promise.resolve();
  }

  removeLabelAsync(label: TaskLabel): Promise<void> {
    const labelRef = this.getTaskLabelCollectionRef(label.taskId).doc(label.id);
    this.uow.delete(labelRef);
    return Promise.resolve();
  }

  private getTaskLabelCollectionRef(taskId: string) {
    const entity = TaskLabel.empty();
    return this.collectionRef()
      .doc(taskId)
      .collection(entity.namespace)
      .withConverter(FactoryConverter.createConverter(entity));
  }
}
