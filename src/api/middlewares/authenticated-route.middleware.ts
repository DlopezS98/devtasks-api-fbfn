import { ITokenService } from "@Application/abstractions/itoken.service";
import { IUsersService } from "@Application/abstractions/iusers.service";
import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";

@injectable()
export class AuthenticatedRouteMiddleware {
  constructor(
    private readonly tokenService: ITokenService,
    private readonly usersService: IUsersService
  ) {}

  handleAsync = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { isValid, payload } = this.tokenService.verifyToken(token);
      if (!isValid || !payload) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await this.usersService.getByIdAsync(payload.uid);
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
