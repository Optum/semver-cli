import { ErrorCode, ErrorExitCode } from "./code.ts";
import { ApplicationError } from "./application.error.ts";

export class HookError extends ApplicationError {
  constructor(
    public readonly hook: string,
    public readonly details: string,
    exitCode: number,
    options?: ErrorOptions,
  ) {
    super(
      ErrorCode.HookFailed,
      ErrorExitCode.HookFailed,
      `Hook ${hook} failed with ${exitCode}`,
      options,
    );
  }
}
