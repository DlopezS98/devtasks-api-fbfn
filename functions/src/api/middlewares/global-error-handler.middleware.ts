import { Request, Response, NextFunction } from "express";
import DomainError, { ErrorCodes } from "@Domain/errors/domain-error";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function globalErrorHandler(err: unknown, _: Request, res: Response, __: NextFunction) {
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof DomainError) {
    message = err.message;
    switch (err.code) {
      case ErrorCodes.NOT_FOUND:
        status = 404;
        break;
      case ErrorCodes.INVALID_ARGUMENT:
      case ErrorCodes.INVALID_EMAIL_FORMAT:
      case ErrorCodes.INVALID_TASK_STATUS:
        status = 400;
        break;
      case ErrorCodes.UNAUTHORIZED:
      case ErrorCodes.INVALID_CREDENTIALS:
        status = 401;
        break;
      case ErrorCodes.FORBIDDEN:
        status = 403;
        break;
      case ErrorCodes.CONFLICT:
      case ErrorCodes.EMAIL_ALREADY_EXISTS:
        status = 409;
        break;
      default:
        status = 500;
        break;
    }
  } else if (err instanceof Error) {
    message = err.message;
    status = 500;
  }

  res.status(status).json({ message });
}
