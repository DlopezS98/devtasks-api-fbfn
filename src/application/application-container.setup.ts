import { Container } from "inversify";

import { IAuthenticationService } from "./abstractions/iauthentication.service";
import { SERVICE_IDENTIFIERS } from "./service-identifiers";
import AuthenticationService from "./use-cases/authentication.service";
import { ILabelsService } from "./abstractions/ilabels.service";
import LabelsService from "./use-cases/labels.service";
import { IUsersService } from "./abstractions/iusers.service";
import UsersService from "./use-cases/users.service";


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
      .bind<IAuthenticationService>(SERVICE_IDENTIFIERS.IAuthService)
      .to(AuthenticationService)
      .inRequestScope();
    this.container
      .bind<ILabelsService>(SERVICE_IDENTIFIERS.ILabelsService)
      .to(LabelsService)
      .inRequestScope();
    this.container
      .bind<IUsersService>(SERVICE_IDENTIFIERS.IUsersService)
      .to(UsersService)
      .inRequestScope();
  }
}
