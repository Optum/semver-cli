import { format, SemVer } from "../../deps/semver.ts";

export enum FormatKind {
  Original = "original",
  Dotnet = "dotnet",
  Docker = "docker",
  Major = "major",
  MajorMinor = "major_minor",
}

export function semverFormats(semver: SemVer): Record<FormatKind, string> {
  const formattedVersion = format(semver);
  const kebabVersion = formattedVersion.replace(/[+]/g, "-");
  return {
    original: formattedVersion,
    docker: kebabVersion,
    dotnet: kebabVersion,
    major: `${semver.major}`,
    major_minor: `${semver.major}.${semver.minor}`,
  };
}

export function semverFormatByKey(
  semver: SemVer,
  prefix = "",
  variantKey: FormatKind = FormatKind.Original,
) {
  const format = semverFormats(semver)[variantKey];
  return `${prefix}${format}`;
}
