import { UserResponseDto } from "@Application/dtos/response/user.dto";
import { Request } from "express";

export default class BaseApiController {
  /**
   * Get the current user from the request object.
   * @param {Request<T>} req The request object.
   * @return {UserResponseDto} The current user.
   * @throws {Error} If no user is found in the request.
   */
  getCurrentUser = <T>(req: Request<T>): UserResponseDto => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const user = req.user;
    if (!user) throw new Error("No user logged user found");

    return user;
  };
}
