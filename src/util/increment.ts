import { increment as inc, parse, SemVer } from "semver";
import { InvalidVersionError } from "../errors/mod.ts";

export enum IncrementKind {
  Major = "major",
  Minor = "minor",
  Patch = "patch",
  None = "none",
}

export type IncrementOptions = {
  version: string | SemVer;
  kind: IncrementKind;
  pre?: string;
  value?: string;
  build?: string;
};

export function increment(options: IncrementOptions) {
  const { kind, version, pre, value, build } = options;

  const semver = parse(version);
  if (!semver) {
    throw new InvalidVersionError(`${version}`);
  }

  return {
    previous: semver,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          return pre && value
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment major and set a specific prerelease value (e.g., alpha.5)
              ...inc(semver, "major", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "premajor", pre, build)
            : inc(semver, "major", undefined, build);
        case IncrementKind.Minor:
          return pre && value !== undefined
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment minor and set a specific prerelease value (e.g., beta.3)
              ...inc(semver, "minor", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "preminor", pre, build)
            : inc(semver, "minor", undefined, build);
        case IncrementKind.Patch:
          return pre && value
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment patch and set a specific prerelease value (e.g., rc.2)
              ...inc(semver, "patch", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "prepatch", pre, build)
            : inc(semver, "patch", undefined, build);
        case IncrementKind.None: {
          if (pre && value && build != undefined) {
            // Custom logic needed: Setting specific prerelease value and build metadata without version increment
            return {
              ...semver,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build.split(".").map((b) => b.trim()),
            };
          } else if (pre && value) {
            // Custom logic needed: Setting specific prerelease value without version increment
            return {
              ...semver,
              prerelease: [...pre.split("."), parseInt(value)],
            };
          } else if (pre) {
            return inc(semver, "pre", pre, build);
          } else if (build !== undefined) {
            // Custom logic needed: JSR @std/semver inc doesn't handle build metadata updates without version increment
            return {
              ...semver,
              build: build.split(".").map((b) => b.trim()),
            };
          } else {
            return semver;
          }
        }
      }
    })(),
  };
}
