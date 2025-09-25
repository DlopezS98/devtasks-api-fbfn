import { UserResponseDto } from "@Application/dtos/response/user.dto";

export interface IUsersService {
  getByIdAsync(id: string): Promise<UserResponseDto | null>;
}
