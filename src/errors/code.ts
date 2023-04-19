export enum ErrorCode {
  VersionFileNotFound = "E_VERSION_FILE_NOT_FOUND",
  InvalidVersion = "E_INVALID_VERSION",
  HookFailed = "E_HOOK_FAILED",
  UnsupportedFileKind = "E_UNSUPPORTED_FILE_KIND",
}

export enum ErrorExitCode {
  VersionFileNotFound = 1,
  InvalidVersion = 2,
  HookFailed = 3,
  UnsupportedFileKind = 4,
}
