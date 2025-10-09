import User, { UserProps } from "@Domain/entities/user.entity";

import { IAsyncRepository } from "./iasync-repository";

export interface IUsersRepository extends IAsyncRepository<User, UserProps> {
  getByEmailAsync(email: string): Promise<User | null>;
}
