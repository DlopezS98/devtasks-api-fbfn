import { ILabelsService } from "@Application/abstractions/ilabels.service";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { LabelRequestDto } from "@Application/dtos/request/label.dto";
import { SERVICE_IDENTIFIERS } from "@Application/service-identifiers";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export default class LabelsController {
  constructor(@inject(SERVICE_IDENTIFIERS.ILabelsService) private readonly labelsService: ILabelsService) {}

  async createAsync(req: Request<LabelRequestDto>, res: Response) {
    try {
      const request: BaseRequestDto<LabelRequestDto> = { userId: "", data: req.body };
      const label = await this.labelsService.addAsync(request);
      res.status(201).json(label);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      res.status(500).json({ error: message });
    }
  }

  async listAsync(req: Request, res: Response) {
    try {
      const labels = await this.labelsService.listAsync();
      res.status(200).json(labels);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      res.status(500).json({ error: message });
    }
  }

  async deleteAsync(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      await this.labelsService.deleteAsync(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      res.status(500).json({ error: message });
    }
  }
}
