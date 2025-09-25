import { UserResponseDto } from "@Application/dtos/response/user.dto";

declare global {
  namespace Express {
    interface Request {
      user?: UserResponseDto;
    }
  }
}
