/* eslint-disable require-jsdoc */
import Email from "../value-objects/email";

import BaseEntity, { BaseEntityProps } from "./base-entity";

export interface UserProps extends BaseEntityProps {
  id: string;
  displayName: string;
  email: Email;
  passwordHash: string;
  passwordSalt: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export default class User extends BaseEntity implements UserProps {
  public get namespace(): string {
    return "Users";
  }

  displayName = "";
  email!: Email;
  passwordHash = "";
  passwordSalt = "";
  isActive = true;
  createdAt!: Date;
  updatedAt: Date | null = null;

  constructor(props: Omit<UserProps, "namespace">) {
    super(props.id);
    this.displayName = props.displayName;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.passwordSalt = props.passwordSalt;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: Omit<UserProps, "id" | "displayName" | "createdAt" | "updatedAt" | "isActive">): User {
    return new User({
      ...props,
      id: "", // ID will be set by the repository
      displayName: props.email.getValue().split("@")[0], // Default display name from email
      createdAt: new Date(), // placeholder, should be set by the repository
      updatedAt: null,
      isActive: true,
    });
  }

  /**
   * Creates an empty User instance with default values.
   * @return {User} An empty User instance with default values.
   */
  static empty(): User {
    return new User({
      id: "",
      displayName: "",
      email: Email.create("email@example.com"),
      passwordHash: "",
      passwordSalt: "",
      isActive: false,
      createdAt: new Date(),
      updatedAt: null,
    });
  }
}
