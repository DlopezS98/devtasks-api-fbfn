/* eslint-disable require-jsdoc */
export interface IDomainEvent<TPayload = unknown> {
  id: string;
  name: string;
  payload: TPayload;
  occurredAt: Date;
}

export default class BaseEntity {
  public get namespace(): string {
    return this.constructor.name.toLowerCase();
  }

  constructor(public readonly id: string) {}

  private readonly _domainEvents: IDomainEvent[] = [];

  protected addDomainEvent<TPayload>(domainEvent: IDomainEvent<TPayload>): void {
    this._domainEvents.push(domainEvent);
  }

  public clearDomainEvents(): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  public removeDomainEvent(eventId: string): void {
    const index = this._domainEvents.findIndex((de) => de.id === eventId);
    if (index > -1) {
      this._domainEvents.splice(index, 1);
    }
  }

  public getDomainEvents(): IDomainEvent[] {
    return [...this._domainEvents];
  }
}
