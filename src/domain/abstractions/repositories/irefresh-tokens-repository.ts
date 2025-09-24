import RefreshToken from "@Domain/entities/refresh-token.entity";
import { IAsyncRepository } from "./iasync-repository";

export interface IRefreshTokensRepository extends IAsyncRepository<RefreshToken> {
  getByTokenAsync(token: string): Promise<RefreshToken | null>;
}
