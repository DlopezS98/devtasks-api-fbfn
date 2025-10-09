export enum ErrorCodes {
  INVALID_ARGUMENT = "INVALID_ARGUMENT",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFLICT = "CONFLICT",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
  INVALID_TASK_STATUS = "INVALID_TASK_STATUS",
}

/**
 * Custom error class for domain-specific errors.
 */
export default class DomainError extends Error {
  public readonly code: ErrorCodes;

  // eslint-disable-next-line require-jsdoc
  constructor(message: string, code: ErrorCodes) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    Error.captureStackTrace(this);
  }
}
