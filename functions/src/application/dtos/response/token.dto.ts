export interface TokenResDto {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}
