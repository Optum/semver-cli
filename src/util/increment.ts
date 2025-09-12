import { increment as inc, SemVer } from "semver";

export enum IncrementKind {
  Major = "major",
  Minor = "minor",
  Patch = "patch",
  None = "none",
}

export interface IncrementOptions {
  version: SemVer;
  kind: IncrementKind;
  prerelease?: string;
  build?: string;
}

export function increment(options: IncrementOptions) {
  const { kind, version, prerelease, build } = options;
  return {
    previous: version,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          return prerelease
            ? inc(version, "premajor", { prerelease, build })
            : inc(version, "major", { build });
        case IncrementKind.Minor:
          return prerelease
            ? inc(version, "preminor", { prerelease, build })
            : inc(version, "minor", { build });
        case IncrementKind.Patch:
          return prerelease
            ? inc(version, "prepatch", { prerelease, build })
            : inc(version, "patch", { build });
        case IncrementKind.None:
          return prerelease ? inc(version, "pre", { prerelease, build }) : {
            ...version,
            prerelease: prerelease
              ? prerelease.split(".")
              : version.prerelease ?? [],
            build: build ? build.split(".") : version.build ?? [],
          };
        default:
          throw new Error(`Unknown increment kind: ${kind}`);
      }
    })(),
  };
}
