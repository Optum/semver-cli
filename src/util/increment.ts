import { parse, SemVer } from "../../deps/semver.ts";
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
            ? (semver.increment("major", undefined, build),
              semver.prerelease = [...pre.split("."), parseInt(value)],
              semver)
            : pre
            ? semver.increment("premajor", pre, build)
            : semver.increment("major", undefined, build);
        case IncrementKind.Minor:
          return pre && value !== undefined
            ? (semver.increment("minor", undefined, build),
              semver.prerelease = [...pre.split("."), parseInt(value)],
              semver)
            : pre
            ? semver.increment("preminor", pre, build)
            : semver.increment("minor", undefined, build);
        case IncrementKind.Patch:
          return pre && value
            ? (semver.increment("patch", undefined, build),
              semver.prerelease = [...pre.split("."), parseInt(value)],
              semver)
            : pre
            ? semver.increment("prepatch", pre, build)
            : semver.increment("patch", undefined, build);
        case IncrementKind.None: {
          if (pre && value && build != undefined) {
            semver.prerelease = [...pre.split("."), parseInt(value)];
            semver.build = build.split(".").map((b) => b.trim());
            return semver;
          } else if (pre && value) {
            semver.prerelease = [...pre.split("."), parseInt(value)];
            return semver;
          } else if (pre) {
            return semver.increment("pre", pre, build);
          } else if (build !== undefined) {
            semver.build = build.split(".").map((b) => b.trim());
            return semver;
          } else {
            return semver;
          }
        }
      }
    })(),
  };
}
