import DomainError, { ErrorCodes } from "@Domain/errors/domain-error";

import ValueObject from "./value-object";

export default class NormalizedName extends ValueObject<{ value: string }> {
  private constructor(name: string) {
    super({ value: name });
  }

  public static create(name: string): NormalizedName {
    if (!name) throw new DomainError("Name cannot be null or undefined", ErrorCodes.INVALID_ARGUMENT);

    const replaceTrialingAndLeadingSpaces = new RegExp(/^\s+|\s+$/g);
    name = name.replace(replaceTrialingAndLeadingSpaces, "").toLowerCase();
    if (name.length === 0) {
      throw new DomainError("Name cannot be empty or only spaces", ErrorCodes.INVALID_ARGUMENT);
    }
    return new NormalizedName(name);
  }

  public getValue(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
