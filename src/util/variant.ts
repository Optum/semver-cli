import { format, SemVer } from "../../deps/semver.ts";

export enum FormatKind {
  Default = "default",
  Dotnet = "dotnet",
  Docker = "docker",
  Major = "major",
}

export function semverFormats(semver: SemVer, prefix = "") {
  const formattedVersion = format(semver);
  const kebabVersion = formattedVersion.replace(/[+]/g, "-");
  const cleanedPrefix = prefix.trim();
  return {
    default: `${cleanedPrefix}${formattedVersion}`,
    dotnet: `${cleanedPrefix}${kebabVersion}`,
    docker: `${cleanedPrefix}${kebabVersion}`,
    major: `${cleanedPrefix}${semver.major}`,
  };
}

export function semverFormatByKey(
  semver: SemVer,
  prefix = "",
  variantKey: FormatKind = FormatKind.Default,
) {
  return semverFormats(semver, prefix)[variantKey];
}
