import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { JwtOptions } from "../models/jwt-options";
import User from "@Domain/entities/user.entity";
import { GeneratedRefreshTokenDto } from "@Application/dtos/response/refresh-token.dto";
import { ITokenService } from "@Application/abstractions/itoken.service";

/* eslint-disable require-jsdoc */
export default class TokenService implements ITokenService {
  constructor(private jwtOptions: JwtOptions) {}

  generateToken(user: User): [string, Date] {
    const secret = this.jwtOptions.signingKey;
    const iatInEpoch = Math.floor(Date.now() / 1000);
    const expirationDate = new Date(Date.now() + this.jwtOptions.accessTokenMinutes * 60 * 1000);
    const expInEpoch = Math.floor(expirationDate.getTime() / 1000);
    const algorithm: jwt.Algorithm = "RS256";

    const claims = {
      alg: algorithm,
      iss: this.jwtOptions.serviceAccountEmail,
      sub: this.jwtOptions.serviceAccountEmail,
      iat: iatInEpoch,
      exp: expInEpoch,
      uid: user.id,
      email: user.email.getValue(),
      displayName: user.displayName,
    };
    const token = jwt.sign(claims, secret, {
      algorithm,
      audience: this.jwtOptions.audience,
    });

    return [token, expirationDate];
  }

  verifyToken(token: string): boolean {
    const secret = this.jwtOptions.signingKey;
    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      // Check if token is expired: Math.floor(Date.now() / 1000) gives current time in seconds since epoch
      return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
    } catch (error) {
      return false;
    }
  }

  generateRefreshToken(): GeneratedRefreshTokenDto {
    const bytes = crypto.randomBytes(64);
    const rawToken = bytes.toString("base64");
    const hashedToken = this.computeHash(rawToken);
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + this.jwtOptions.refreshTokenDays * 24 * 60 * 60 * 1000);

    return {
      rawToken,
      hashedToken,
      expiresAt,
    };
  }

  private computeHash(raw: string): string {
    const hash = crypto.createHash("sha256").update(Buffer.from(raw, "utf-8")).digest();
    return hash.toString("base64");
  }
}
