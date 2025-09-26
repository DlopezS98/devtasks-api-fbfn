import { injectable } from "inversify";

import Environment from "../../environment";

@injectable()
export class JwtOptions {
  private constructor(
    public readonly issuer: string,
    public readonly audience: string,
    public readonly signingKey: string,
    public readonly accessTokenMinutes: number,
    public readonly refreshTokenDays: number,
    public readonly serviceAccountEmail: string
  ) {}

  static fromEnvironment(environment: Environment): JwtOptions {
    return new JwtOptions(
      environment.JWT_ISSUER,
      environment.JWT_AUDIENCE,
      environment.JWT_SIGNING_KEY,
      environment.JWT_ACCESS_TOKEN_MINUTES,
      environment.JWT_REFRESH_TOKEN_DAYS,
      environment.SERVICE_ACCOUNT_EMAIL
    );
  }
}
