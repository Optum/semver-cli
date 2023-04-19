import { ErrorCode, ErrorExitCode } from "./code.ts";
import { ApplicationError } from "./application.error.ts";

export class InvalidVersionError extends ApplicationError {
  constructor(
    public readonly version: string,
    options?: ErrorOptions,
  ) {
    super(
      ErrorCode.InvalidVersion,
      ErrorExitCode.InvalidVersion,
      `Version ${version} is invalid`,
      options,
    );
  }
}
