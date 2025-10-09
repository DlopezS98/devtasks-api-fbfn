export interface GeneratedRefreshTokenDto {
  rawToken: string;
  hashedToken: string;
  expiresAt: Date;
}
