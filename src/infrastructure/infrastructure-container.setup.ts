import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import { SERVICE_IDENTIFIERS } from "@Domain/service-identifiers";
import { SERVICE_IDENTIFIERS as APP_SERVICE_IDENTIFIERS } from "@Application/service-identifiers";
import { Container } from "inversify";
import { IPasswordHasherService } from "@Application/abstractions/ipassword-hasher.service";
import { ITokenService } from "@Application/abstractions/itoken.service";

import UnitOfWork from "./data/repositories/unit-of-work";
import FirestoreContext from "./data/firestore.context";
import PasswordHasherService from "./services/password-hasher.service";
import TokenService from "./services/token.service";

export default class InfrastructureContainerSetup {
  private loaded = false;
  private static instance: InfrastructureContainerSetup;
  private constructor(private readonly container: Container) {}

  static getInstance(container: Container): InfrastructureContainerSetup {
    if (!InfrastructureContainerSetup.instance) {
      InfrastructureContainerSetup.instance = new InfrastructureContainerSetup(container);
    }
    return InfrastructureContainerSetup.instance;
  }

  public load(): void {
    if (this.loaded) return;

    this.loaded = true;
    this.container.bind(FirestoreContext).toSelf().inSingletonScope();
    this.container.bind<IUnitOfWork>(SERVICE_IDENTIFIERS.IUnitOfWork).to(UnitOfWork).inRequestScope();
    this.container
      .bind<IPasswordHasherService>(APP_SERVICE_IDENTIFIERS.IPasswordHasher)
      .to(PasswordHasherService)
      .inRequestScope();
    this.container
      .bind<ITokenService>(APP_SERVICE_IDENTIFIERS.ITokenService)
      .to(TokenService)
      .inRequestScope();
    // Register other infrastructure services here as needed...
  }
}
