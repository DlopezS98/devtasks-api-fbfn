export interface JwtOptions {
  issuer: string;
  audience: string;
  signingKey: string;
  accessTokenMinutes: number;
  refreshTokenDays: number;
  serviceAccountEmail: string;
}
