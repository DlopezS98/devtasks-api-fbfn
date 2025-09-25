/* eslint-disable require-jsdoc */
import * as crypto from "crypto";

import { IPasswordHasherService } from "@Application/abstractions/ipassword-hasher.service";
import { injectable } from "inversify";

@injectable()
export default class PasswordHasherService implements IPasswordHasherService {
  private static readonly Iterations = 100_000;
  private static readonly HashByteSize = 32;
  private static readonly SaltByteSize = 16;

  hashPassword(password: string): { hashedPassword: string; salt: Buffer } {
    const salt = this.generateSalt();
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      PasswordHasherService.Iterations,
      PasswordHasherService.HashByteSize,
      "sha256"
    );
    return { hashedPassword: hash.toString("base64"), salt };
  }

  verifyPassword(hashedPassword: string, salt: Buffer, password: string): boolean {
    const storedHash = Buffer.from(hashedPassword, "base64");
    const computedHash = crypto.pbkdf2Sync(
      password,
      salt,
      PasswordHasherService.Iterations,
      PasswordHasherService.HashByteSize,
      "sha256"
    );

    // Fixed-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(storedHash, computedHash);
  }

  private generateSalt(): Buffer {
    return crypto.randomBytes(PasswordHasherService.SaltByteSize);
  }
}
