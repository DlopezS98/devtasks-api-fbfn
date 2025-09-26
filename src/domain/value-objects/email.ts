import DomainError, { ErrorCodes } from "../errors/domain-error";
import InvalidEmailError from "../errors/invalid-email.error";

import ValueObject from "./value-object";

interface EmailProps {
  value: string;
}

/**
 * Value Object representing an Email.
 */
export default class Email extends ValueObject<EmailProps> {
  // eslint-disable-next-line max-len
  private static emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  // eslint-disable-next-line require-jsdoc
  private constructor(email: string) {
    super({ value: email });
  }

  /**
   * Factory method to create an Email value object.
   * @param {string} email The email string to validate and create the Email value object.
   * @return {Email} An instance of the Email value object.
   * @throws {InvalidEmailError} If the email format is invalid.
   * @throws {DomainError} If the email is empty.
   */
  public static create(email: string): Email {
    if (!email) throw new DomainError("Email cannot be empty", ErrorCodes.INVALID_ARGUMENT);

    const normalizedEmail = email.trim().toLowerCase();

    if (!this.emailRegex.test(normalizedEmail)) {
      console.error("Invalid email format:", normalizedEmail);
      throw new InvalidEmailError(normalizedEmail);
    }

    return new Email(normalizedEmail);
  }

  /**
   * Get the email value.
   * @return {string} The email string.
   */
  public getValue(): string {
    return this.props.value;
  }

  /**
   * Return the email as a string.
   * @return {string} The email string.
   */
  public toString(): string {
    return this.props.value;
  }
}
