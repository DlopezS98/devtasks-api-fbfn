import Label from "@Domain/entities/labels.entity";

import { IAsyncRepository } from "./iasync-repository";

export interface ILabelsRepository extends IAsyncRepository<Label> {
  getByNameAsync(name: string): Promise<Label | null>;
  getByUserAsync(userId: string): Promise<Label[]>;
}
