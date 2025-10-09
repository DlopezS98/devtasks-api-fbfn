/* eslint-disable require-jsdoc */
import RefreshToken, { RefreshTokenProps } from "@Domain/entities/refresh-token.entity";
import { IRefreshTokensRepository } from "@Domain/abstractions/repositories/irefresh-tokens-repository";

import FirestoreRepository from "./firestore.repository";
import UnitOfWork from "./unit-of-work";

export default class RefreshTokensRepository
  extends FirestoreRepository<RefreshToken, RefreshTokenProps>
  implements IRefreshTokensRepository {
  constructor(firestore: FirebaseFirestore.Firestore, uow: UnitOfWork) {
    super(firestore, uow, () => RefreshToken.empty());
  }

  async getByTokenAsync(token: string): Promise<RefreshToken | null> {
    const query = this.collectionRef().where("token", "==", token).limit(1);
    const snapshot = await query.get();
    return snapshot.empty ? null : (snapshot.docs[0].data());
  }
}
