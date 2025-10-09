/* eslint-disable require-jsdoc */
import DomainError, { ErrorCodes } from "./domain-error";

export default class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email format for value: ${email}`, ErrorCodes.INVALID_EMAIL_FORMAT);
  }
}
