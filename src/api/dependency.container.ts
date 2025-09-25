import "reflect-metadata";
import { Container } from "inversify";
import InfrastructureContainerSetup from "@Infrastructure/infrastructure-container.setup";
import ApplicationContainer from "@Application/application-container.setup";

import AuthenticationController from "./controllers/authentication.controller";
import LabelsController from "./controllers/labels.controller";
import { AuthenticatedRouteMiddleware } from "./middlewares/authenticated-route.middleware";

export default class DependencyContainer {
  private static instance: DependencyContainer;
  private readonly infrastructureServices: InfrastructureContainerSetup;
  private readonly applicationServices: ApplicationContainer;
  private readonly container: Container;

  private constructor() {
    this.container = new Container({ defaultScope: "Request" });
    this.infrastructureServices = InfrastructureContainerSetup.getInstance(this.container);
    this.applicationServices = ApplicationContainer.getInstance(this.container);
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public initialize(): DependencyContainer {
    // Middlewares here...
    this.container.bind(AuthenticatedRouteMiddleware).toSelf().inRequestScope();

    // Register controllers here...
    this.container.bind(AuthenticationController).toSelf().inRequestScope();
    this.container.bind(LabelsController).toSelf().inRequestScope();

    // Layer setups...
    this.infrastructureServices.load();
    this.applicationServices.load();
    return this;
  }

  public getContainer(): Container {
    return this.container;
  }
}
