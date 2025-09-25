import { IUsersService } from "@Application/abstractions/iusers.service";
import { UserResponseDto } from "@Application/dtos/response/user.dto";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import EntityNotFoundError from "@Domain/errors/entity-not-found.error";
import { SERVICE_IDENTIFIERS } from "@Domain/service-identifiers";
import { inject, injectable } from "inversify";

@injectable()
export default class UsersService implements IUsersService {
  constructor(@inject(SERVICE_IDENTIFIERS.IUnitOfWork) private readonly unitOfWork: IUnitOfWork) {}

  async getByIdAsync(id: string): Promise<UserResponseDto> {
    const user = await this.unitOfWork.usersRepository.getAsync(id);
    if (!user) throw new EntityNotFoundError("User");

    return {
      id: user.id,
      email: user.email.getValue(),
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
