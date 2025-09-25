import User from "@Domain/entities/user.entity";
import { JwtPayloadDto } from "@Application/dtos/response/jwt-payload.dto";

import { GeneratedRefreshTokenDto } from "../dtos/response/refresh-token.dto";

export interface ITokenService {
  generateToken(user: User): [string, Date];
  /**
   * Verifies the given JWT token and returns its validity and payload.
   * @param {string} token The JWT token string to verify.
   * @returns An object containing a boolean `isValid` indicating if the token is valid,
   *          and a `payload` which is the decoded JWT payload if valid, or null if invalid.
   */
  verifyToken(token: string): { isValid: boolean, payload: JwtPayloadDto | null };
  generateRefreshToken(): GeneratedRefreshTokenDto;
}
