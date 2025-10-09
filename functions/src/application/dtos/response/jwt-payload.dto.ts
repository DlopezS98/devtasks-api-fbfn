export interface JwtPayloadDto {
  uid: string;
  email: string;
  displayName: string;
  iat: number;
  exp: number;
}
