import NormalizedName from "@Domain/value-objects/normalized-name";

import BaseEntity from "./base-entity";

export interface ILabelProps {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdBy: string;
  isActive: boolean;
}

export default class Label extends BaseEntity implements ILabelProps {
  public get namespace(): string {
    return "Labels";
  }

  name = "";
  color = "";
  createdAt!: Date;
  updatedAt: Date | null = null;
  createdBy = "";
  isActive = true;

  get normalizedName(): NormalizedName {
    return NormalizedName.create(this.name);
  }

  constructor(props: ILabelProps) {
    super(props.id);
    this.name = props.name;
    this.color = props.color;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.createdBy = props.createdBy;
    this.isActive = props.isActive;
  }

  static empty(): Label {
    return new Label({
      id: "",
      name: "",
      color: "",
      createdAt: new Date(),
      updatedAt: null,
      createdBy: "",
      isActive: true,
    });
  }

  static create(name: string, color: string, createdBy: string): Label {
    return new Label({
      id: "",
      name,
      color,
      createdAt: new Date(),
      updatedAt: null,
      createdBy,
      isActive: true,
    });
  }
}
