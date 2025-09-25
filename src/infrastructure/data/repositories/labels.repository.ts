import Label from "@Domain/entities/labels.entity";
import { ILabelsRepository } from "@Domain/abstractions/repositories/ilabels-repository";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class LabelsRepository extends FirestoreRepository<Label> implements ILabelsRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => Label.empty());
  }

  async getByNameAsync(name: string): Promise<Label | null> {
    const query = this.collectionRef().where("normalizedName", "==", name).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : (snapshot.docs[0].data());
  }
}
