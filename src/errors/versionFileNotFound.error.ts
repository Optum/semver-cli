import { ErrorCode, ErrorExitCode } from "./code.ts";
import { ApplicationError } from "./application.error.ts";

export class VersionFileNotFoundError extends ApplicationError {
  constructor(options?: ErrorOptions) {
    super(
      ErrorCode.VersionFileNotFound,
      ErrorExitCode.VersionFileNotFound,
      "VERSION file not found",
      options,
    );
  }
}
