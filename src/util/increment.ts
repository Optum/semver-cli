import { increment as inc, parse, SemVer } from "../../deps/semver.ts";
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
    throw new InvalidVersionError(version.toString());
  }
  return {
    previous: semver,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          return pre && value
            ? {
              ...inc(semver, "major", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "premajor", pre, build)
            : inc(semver, "major", undefined, build);
        case IncrementKind.Minor:
          return pre && value !== undefined
            ? {
              ...inc(semver, "minor", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "preminor", pre, build)
            : inc(semver, "minor", undefined, build);
        case IncrementKind.Patch:
          return pre && value
            ? {
              ...inc(semver, "patch", undefined, build),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "prepatch", pre, build)
            : inc(semver, "patch", undefined, build);
        case IncrementKind.None: {
          if (pre && value && build != undefined) {
            return {
              ...semver,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build.split(".").map((b) => b.trim()),
            };
          } else if (pre && value) {
            return {
              ...semver,
              prerelease: [...pre.split("."), parseInt(value)],
            };
          } else if (pre) {
            return inc(semver, "pre", pre, build);
          } else if (build !== undefined) {
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
