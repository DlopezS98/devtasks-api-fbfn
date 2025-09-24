import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import { SERVICE_IDENTIFIERS } from "@Domain/service-identifiers";
import { Container } from "inversify";

import UnitOfWork from "./data/repositories/unit-of-work";
import FirestoreContext from "./data/firestore.context";

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
    // Register other infrastructure services here as needed...
  }
}
