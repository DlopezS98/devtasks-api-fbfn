import { Container } from "inversify";
import PasswordHasherService from "@Infrastructure/services/password-hasher.service";
import TokenService from "@Infrastructure/services/token.service";

import { IAuthenticationService } from "./abstractions/iauthentication.service";
import { SERVICE_IDENTIFIERS } from "./service-identifiers";
import AuthenticationService from "./use-cases/authentication.service";
import { IPasswordHasherService } from "./abstractions/ipassword-hasher.service";
import { ITokenService } from "./abstractions/itoken.service";


export default class ApplicationContainer {
  private loaded = false;
  private static instance: ApplicationContainer;

  private constructor(private readonly container: Container) {}

  public static getInstance(container: Container): ApplicationContainer {
    if (!ApplicationContainer.instance) {
      ApplicationContainer.instance = new ApplicationContainer(container);
    }
    return ApplicationContainer.instance;
  }

  public load(): void {
    if (this.loaded) return;

    this.loaded = true;

    this.container
      .bind<IPasswordHasherService>(SERVICE_IDENTIFIERS.IPasswordHasher)
      .to(PasswordHasherService)
      .inRequestScope();
    this.container
      .bind<ITokenService>(SERVICE_IDENTIFIERS.ITokenService)
      .to(TokenService)
      .inRequestScope();
    this.container
      .bind<IAuthenticationService>(SERVICE_IDENTIFIERS.IAuthService)
      .to(AuthenticationService)
      .inRequestScope();
  }
}
