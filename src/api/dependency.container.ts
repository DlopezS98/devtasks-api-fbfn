import "reflect-metadata";
import { Container } from "inversify";
import InfrastructureContainerSetup from "@Infrastructure/infrastructure-container.setup";

export default class DependencyContainer {
  private static instance: DependencyContainer;
  private readonly infrastructureServices: InfrastructureContainerSetup;
  public readonly container: Container;

  private constructor() {
    this.container = new Container({ defaultScope: "Request" });
    this.infrastructureServices = InfrastructureContainerSetup.getInstance(this.container);
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  public initialize(): void {
    this.infrastructureServices.load();
  }
}
