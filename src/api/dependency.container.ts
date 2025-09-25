import "reflect-metadata";
import { Container } from "inversify";
import InfrastructureContainerSetup from "@Infrastructure/infrastructure-container.setup";
import ApplicationContainer from "@Application/application-container.setup";

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
    this.infrastructureServices.load();
    this.applicationServices.load();
    return this;
  }

  public getContainer(): Container {
    return this.container;
  }
}
