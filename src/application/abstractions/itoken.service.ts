import { GeneratedRefreshTokenDto } from "../dtos/response/refresh-token.dto";
import User from "@Domain/entities/user.entity";

export interface ITokenService {
  generateToken(user: User): [string, Date];
  verifyToken(token: string): boolean;
  generateRefreshToken(): GeneratedRefreshTokenDto;
}
