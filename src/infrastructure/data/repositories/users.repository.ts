/* eslint-disable require-jsdoc */
import User from "@Domain/entities/user";
import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";
import { IUsersRepository } from "@Domain/abstractions/repositories/iusers-repository";

export default class UsersRepository extends FirestoreRepository<User> implements IUsersRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => User.empty());
  }

  async getByEmailAsync(email: string): Promise<User | null> {
    const query = this.collectionRef().where("email", "==", email).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : (snapshot.docs[0].data());
  }
}
