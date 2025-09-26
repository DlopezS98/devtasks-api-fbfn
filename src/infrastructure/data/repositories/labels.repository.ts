import Label, { LabelProps } from "@Domain/entities/labels.entity";
import { ILabelsRepository } from "@Domain/abstractions/repositories/ilabels-repository";
import NormalizedName from "@Domain/value-objects/normalized-name";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class LabelsRepository extends FirestoreRepository<Label, LabelProps> implements ILabelsRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => Label.empty());
  }

  async getByIdsAsync(labelIds: string[]): Promise<Label[]> {
    if (labelIds.length === 0) return [];

    const batches: string[][] = [];
    const batchSize = 10; // Firestore 'in' queries support up to 10 values

    for (let i = 0; i < labelIds.length; i += batchSize) {
      batches.push(labelIds.slice(i, i + batchSize));
    }

    const results: Label[] = [];
    for (const batch of batches) {
      const query = this.collectionRef().where("id", "in", batch);
      const snapshot = await query.get();
      if (snapshot.empty) continue;

      results.push(...snapshot.docs.map((doc) => doc.data()));
    }

    return results;
  }

  async getByNameAsync(name: string): Promise<Label | null> {
    const query = this.collectionRef().where("normalizedName", "==", NormalizedName.create(name).getValue()).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : (snapshot.docs[0].data());
  }

  async getByUserAsync(userId: string): Promise<Label[]> {
    const query = this.collectionRef().where("createdBy", "==", userId).where("isActive", "==", true);
    const snapshot = await query.get();
    return snapshot.empty ? [] : snapshot.docs.map((doc) => doc.data());
  }
}
