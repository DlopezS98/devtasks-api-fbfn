export interface AuthenticateUserReqDto {
  email: string;
  password: string;
  ipAddress: string;
  userAgent: string;
  deviceName: string;
}
