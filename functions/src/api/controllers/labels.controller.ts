import { AuthenticatedRouteMiddleware } from "@Api/middlewares/authenticated-route.middleware";
import { ILabelsService } from "@Application/abstractions/ilabels.service";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { LabelRequestDto } from "@Application/dtos/request/label.dto";
import { SERVICE_IDENTIFIERS } from "@Application/service-identifiers";
import { Request, RequestHandler, Response } from "express";
import { inject, injectable } from "inversify";

import BaseApiController from "./base-api.controller";

@injectable()
export default class LabelsController extends BaseApiController {
  constructor(
    @inject(SERVICE_IDENTIFIERS.ILabelsService) private readonly labelsService: ILabelsService,
    @inject(AuthenticatedRouteMiddleware) private readonly authMiddleware: AuthenticatedRouteMiddleware,
  ) {
    super();
  }

  /**
   * Get the array of middlewares to be applied to the routes in this controller
   * @return {Array<RequestHandler>} Array of middlewares to be applied to the routes in this controller
   */
  public getMiddlewares = (): RequestHandler[] => [this.authMiddleware.handleAsync];

  async createAsync(req: Request<LabelRequestDto>, res: Response) {
    const user = this.getCurrentUser(req);
    const request: BaseRequestDto<LabelRequestDto> = { userId: user.id, data: req.body };
    const label = await this.labelsService.addAsync(request);
    res.status(201).json(label);
  }

  async listAsync(req: Request, res: Response) {
    const user = this.getCurrentUser(req);
    const labels = await this.labelsService.listAsync(user.id);
    res.status(200).json(labels);
  }

  async deleteAsync(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    await this.labelsService.deleteAsync(id);
    res.status(204).send();
  }

  async updateAsync(req: Request<{ id: string }, LabelRequestDto>, res: Response) {
    const { id } = req.params;
    const user = this.getCurrentUser(req);
    const request: BaseRequestDto<LabelRequestDto> = { userId: user.id, data: req.body };
    const updatedLabel = await this.labelsService.updateAsync(id, request);
    res.status(200).json(updatedLabel);
  }
}
