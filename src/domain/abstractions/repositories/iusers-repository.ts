import User from "@Domain/entities/user.entity";

import { IAsyncRepository } from "./iasync-repository";

export interface IUsersRepository extends IAsyncRepository<User> {
  getByEmailAsync(email: string): Promise<User | null>;
}
