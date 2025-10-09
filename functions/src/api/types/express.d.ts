import { UserResponseDto } from "@Application/dtos/response/user.dto";

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
    }
  }
}

// This export makes this file a module and ensures the declaration is included
export {};
