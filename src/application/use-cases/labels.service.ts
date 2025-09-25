import * as crypto from "crypto";

import { ILabelsService } from "@Application/abstractions/ilabels.service";
import { BaseRequestDto } from "@Application/dtos/request/base-request.dto";
import { LabelRequestDto } from "@Application/dtos/request/label.dto";
import { LabelResponseDto } from "@Application/dtos/response/label.dto";
import { inject, injectable } from "inversify";
import { SERVICE_IDENTIFIERS } from "@Domain/service-identifiers";
import { IUnitOfWork } from "@Domain/abstractions/repositories/iunit-of-work";
import Label from "@Domain/entities/labels.entity";
import EntityNotFoundError from "@Domain/errors/entity-not-found.error";

@injectable()
export default class LabelsService implements ILabelsService {
  constructor(@inject(SERVICE_IDENTIFIERS.IUnitOfWork) private readonly unitOfWork: IUnitOfWork) {}

  async AddAsync(request: BaseRequestDto<LabelRequestDto>): Promise<LabelResponseDto> {
    const existingLabel = await this.unitOfWork.labelsRepository.getByNameAsync(request.data.name);
    if (existingLabel) throw new Error("Label with the same name already exists.");

    const color = this.generateRandomColor(request.data.name);
    const label = Label.create(request.data.name, color, request.userId);
    const newLabel = await this.unitOfWork.labelsRepository.addAsync(label);
    await this.unitOfWork.saveChangesAsync();

    return {
      id: newLabel.id,
      name: newLabel.name,
      color: newLabel.color,
      createdAt: newLabel.createdAt,
      updatedAt: newLabel.updatedAt,
    };
  }

  async DeleteAsync(id: string): Promise<void> {
    const label = await this.unitOfWork.labelsRepository.getAsync(id);
    if (!label) throw new EntityNotFoundError(Label.name);

    label.isActive = false;
    await this.unitOfWork.labelsRepository.updateAsync(label);
    await this.unitOfWork.saveChangesAsync();
  }

  async listAsync(): Promise<LabelResponseDto[]> {
    const labels = await this.unitOfWork.labelsRepository.listAsync();
    return labels.map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color,
      createdAt: label.createdAt,
      updatedAt: label.updatedAt,
    }));
  }

  private generateRandomColor(name: string): string {
    const firstChar = name.charAt(0).toUpperCase();
    const hash = crypto.createHash("sha256").update(firstChar, "utf8").digest("hex");
    const color = `#${hash.slice(0, 6)}`;
    return color;
  }
}
