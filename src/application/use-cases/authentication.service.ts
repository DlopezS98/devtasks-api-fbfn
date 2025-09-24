/* eslint-disable require-jsdoc */
import { IAuthenticationService } from "@Application/abstractions/iauthentication.service";
import { IPasswordHasherService } from "@Application/abstractions/ipassword-hasher.service";
import { ITokenService } from "@Application/abstractions/itoken.service";
import { AuthenticateUserReqDto } from "@Application/dtos/request/authenticate-user.dto";
import { TokenResDto } from "@Application/dtos/response/token.dto";
import { UserResponseDto } from "@Application/dtos/response/user.dto";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import RefreshToken from "@Domain/entities/refresh-token.entity";
import User from "@Domain/entities/user.entity";
import DomainError, { ErrorCodes } from "@Domain/errors/domain-error";
import EntityNotFoundError from "@Domain/errors/entity-not-found.error";
import Email from "@Domain/value-objects/email";

export default class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasherService,
  ) {}

  async authenticateAsync(request: AuthenticateUserReqDto): Promise<TokenResDto> {
    const email = Email.create(request.email);
    const password = request.password;

    const user = await this.unitOfWork.usersRepository.getByEmailAsync(email.getValue());
    if (!user) throw new EntityNotFoundError("User");

    const salt = Buffer.from(user.passwordSalt, "base64");
    const isPasswordValid = this.passwordHasher.verifyPassword(user.passwordHash, salt, password);
    if (!isPasswordValid) throw new DomainError("Invalid credentials", ErrorCodes.INVALID_CREDENTIALS);

    const [accessToken, tokenExpiresAt] = this.tokenService.generateToken(user);
    const {
      rawToken: refreshToken,
      hashedToken,
      expiresAt: refreshTokenExpiresAt,
    } = this.tokenService.generateRefreshToken();
    const newRefreshToken = RefreshToken.create({
      userId: user.id,
      tokenHash: hashedToken,
      expiresAt: refreshTokenExpiresAt,
      createdByIp: request.ipAddress,
      deviceName: request.deviceName,
      userAgent: request.userAgent,
    });
    await this.unitOfWork.refreshTokensRepository.addAsync(newRefreshToken);
    await this.unitOfWork.saveChangesAsync();

    return { accessToken, refreshToken, tokenExpiresAt, refreshTokenExpiresAt };
  }

  async registerAsync(request: AuthenticateUserReqDto): Promise<UserResponseDto> {
    const email = Email.create(request.email);
    const password = request.password;

    const user = await this.unitOfWork.usersRepository.getByEmailAsync(email.getValue());
    if (user) throw new DomainError("Email already in use", ErrorCodes.EMAIL_ALREADY_EXISTS);

    const { hashedPassword, salt } = this.passwordHasher.hashPassword(password);
    const newUser = User.create({ email: email, passwordHash: hashedPassword, passwordSalt: salt.toString("base64") });
    await this.unitOfWork.usersRepository.addAsync(newUser);
    await this.unitOfWork.saveChangesAsync();

    return {
      id: newUser.id,
      email: newUser.email.getValue(),
      displayName: newUser.displayName,
      createdAt: newUser.createdAt,
    };
  }
}
