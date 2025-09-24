/* eslint-disable require-jsdoc */
import DomainError, { ErrorCodes } from "./domain-error";

export default class EntityNotFoundError extends DomainError {
  constructor(name: string) {
    super(`Entity (${name}) not found`, ErrorCodes.NOT_FOUND);
  }
}
