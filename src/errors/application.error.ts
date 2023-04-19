import { ErrorCode, ErrorExitCode } from "./code.ts";

export class ApplicationError extends Error {
  public readonly isApplicationError = true;
  constructor(
    public readonly code: ErrorCode,
    public readonly exitCode: ErrorExitCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
