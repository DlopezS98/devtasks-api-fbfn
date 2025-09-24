/* eslint-disable require-jsdoc */
import Email from "../value-objects/email";
import BaseEntity from "./base-entity";

export interface IUserProps {
  id: string;
  displayName: string;
  email: Email;
  passwordHash: string;
  passwordSalt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export default class User extends BaseEntity implements IUserProps {
  displayName = "";
  email!: Email;
  passwordHash = "";
  passwordSalt = "";
  isActive = true;
  createdAt!: Date;
  updatedAt: Date | null = null;

  constructor(props: IUserProps) {
    super(props.id);
    this.displayName = props.displayName;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.passwordSalt = props.passwordSalt;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
