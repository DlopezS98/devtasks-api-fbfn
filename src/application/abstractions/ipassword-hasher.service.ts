export interface IPasswordHasherService {
  hashPassword(password: string): { hashedPassword: string; salt: Buffer };
  verifyPassword(hashedPassword: string, salt: Buffer, password: string): boolean;
}
