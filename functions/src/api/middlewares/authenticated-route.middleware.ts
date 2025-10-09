import { ITokenService } from "@Application/abstractions/itoken.service";
import { IUsersService } from "@Application/abstractions/iusers.service";
import { SERVICE_IDENTIFIERS } from "@Application/service-identifiers";
import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class AuthenticatedRouteMiddleware {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ITokenService)
    private readonly tokenService: ITokenService,
    @inject(SERVICE_IDENTIFIERS.IUsersService)
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}
