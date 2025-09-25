import Label from "@Domain/entities/labels.entity";
import { ILabelsRepository } from "@Domain/abstractions/repositories/ilabels-repository";
import NormalizedName from "@Domain/value-objects/normalized-name";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class LabelsRepository extends FirestoreRepository<Label> implements ILabelsRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => Label.empty());
  }

  async getByNameAsync(name: string): Promise<Label | null> {
    const query = this.collectionRef().where("normalizedName", "==", NormalizedName.create(name).getValue()).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : (snapshot.docs[0].data());
  }

  async getByUserAsync(userId: string): Promise<Label[]> {
    const query = this.collectionRef().where("createdBy", "==", userId);
    const snapshot = await query.get();
    return snapshot.empty ? [] : snapshot.docs.map((doc) => doc.data());
  }
}
