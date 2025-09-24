/* eslint-disable require-jsdoc */
import BaseEntity from "./base-entity";

export interface IRefreshTokenProps {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  readonly isRevoked: boolean;
  createdByIp: string;
  userAgent: string;
  deviceName: string;
}

export default class RefreshToken extends BaseEntity implements IRefreshTokenProps {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;
  createdByIp: string;
  userAgent: string;
  deviceName: string;

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  constructor(props: Omit<IRefreshTokenProps, "isRevoked">) {
    super(props.id);
    this.userId = props.userId;
    this.tokenHash = props.tokenHash;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
    this.revokedAt = props.revokedAt;
    this.createdByIp = props.createdByIp;
    this.userAgent = props.userAgent;
    this.deviceName = props.deviceName;
  }

  static empty(): RefreshToken {
    return new RefreshToken({
      id: "",
      userId: "",
      tokenHash: "",
      expiresAt: new Date(),
      createdAt: new Date(),
      revokedAt: null,
      createdByIp: "",
      userAgent: "",
      deviceName: "",
    });
  }
}
