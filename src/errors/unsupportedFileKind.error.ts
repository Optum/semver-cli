import { ErrorCode, ErrorExitCode } from "./code.ts";
import { ApplicationError } from "./application.error.ts";

export class UnsupportedFileKindError extends ApplicationError {
  constructor(
    public readonly file: string,
    options?: ErrorOptions,
  ) {
    super(
      ErrorCode.UnsupportedFileKind,
      ErrorExitCode.UnsupportedFileKind,
      `File ${file} is not a supported kind`,
      options,
    );
  }
}
