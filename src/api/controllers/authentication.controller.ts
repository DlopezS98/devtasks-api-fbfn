import { Request, Response } from "express";
import { IAuthenticationService } from "@Application/abstractions/iauthentication.service";
import { AuthenticateUserReqDto, UserAuthReqDto } from "@Application/dtos/request/authenticate-user.dto";
import { inject, injectable } from "inversify";
import { SERVICE_IDENTIFIERS } from "@Application/service-identifiers";

@injectable()
export default class AuthenticationController {
  constructor(@inject(SERVICE_IDENTIFIERS.IAuthService) private readonly authService: IAuthenticationService) {}

  async loginAsync(req: Request<UserAuthReqDto>, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const request: AuthenticateUserReqDto = {
        email,
        password,
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown",
        deviceName: Array.isArray(req.headers["x-device-name"]) ?
          req.headers["x-device-name"][0] :
          req.headers["x-device-name"] || "unknown",
      };
      const tokens = await this.authService.authenticateAsync(request);
      res.send(tokens);
    } catch (error) {
      console.error("Authentication error:", error instanceof Error ? error.message : error);
      res.status(401).send({ error: "Invalid email or password" });
    }
  }

  async registerAsync(req: Request<UserAuthReqDto>, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      const request: AuthenticateUserReqDto = {
        email,
        password,
        ipAddress: req.ip || "127.0.0.1",
        userAgent: req.headers["user-agent"] || "unknown",
        deviceName: Array.isArray(req.headers["x-device-name"]) ?
          req.headers["x-device-name"][0] :
          req.headers["x-device-name"] || "unknown",
      };
      const newUser = await this.authService.registerAsync(request);
      res.status(201).send(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).send({ error: "Failed to register user" });
    }
  }
}
