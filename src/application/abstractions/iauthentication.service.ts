import { AuthenticateUserReqDto } from "@Application/dtos/request/authenticate-user.dto";
import { TokenResDto } from "@Application/dtos/response/token.dto";

export interface IAuthenticationService {
  authenticateAsync(request: AuthenticateUserReqDto): Promise<TokenResDto>;
}
