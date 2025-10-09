import { AuthenticateUserReqDto } from "@Application/dtos/request/authenticate-user.dto";
import { TokenResDto } from "@Application/dtos/response/token.dto";
import { UserResponseDto } from "@Application/dtos/response/user.dto";

export interface IAuthenticationService {
  validateTokenAsync(token: string): Promise<UserResponseDto | null>;
  authenticateAsync(request: AuthenticateUserReqDto): Promise<TokenResDto>;
  registerAsync(request: AuthenticateUserReqDto): Promise<UserResponseDto>;
}
