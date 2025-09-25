import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "inversify";
import { AuthenticatedRouteMiddleware } from "@Api/middlewares/authenticated-route.middleware";
import { ITasksService } from "@Application/abstractions/itasks.service";
import { SERVICE_IDENTIFIERS } from "@Application/service-identifiers";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { CreateTaskRequestDto } from "@Application/dtos/request/task.dto";

import BaseApiController from "./base-api.controller";

@injectable()
export default class TasksController extends BaseApiController {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ITasksService) private readonly tasksService: ITasksService,
    @inject(AuthenticatedRouteMiddleware) private readonly authMiddleware: AuthenticatedRouteMiddleware,
  ) {
    super();
  }

  /**
   * Get the array of middlewares to be applied to the routes in this controller
   * @return {Array<RequestHandler>} Array of middlewares to be applied to the routes in this controller
   */
  public getMiddlewares = (): RequestHandler[] => [this.authMiddleware.handleAsync];

  async createAsync(req: Request<CreateTaskRequestDto>, res: Response) {
    try {
      const user = this.getCurrentUser(req);
      const request: BaseRequestDto<CreateTaskRequestDto> = { userId: user.id, data: req.body };
      const task = await this.tasksService.createAsync(request);
      res.status(201).json(task);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      res.status(500).json({ error: message });
    }
  }
}
