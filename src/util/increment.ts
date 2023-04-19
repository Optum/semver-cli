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
  build?: string;
};

export function increment(options: IncrementOptions) {
  const { kind, version, pre, build } = options;
  const semver = parse(version);
  if (!semver) {
    throw new InvalidVersionError(version.toString());
  }

  return {
    previous: semver,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          return pre
            ? semver.increment("premajor", pre, build)
            : semver.increment("major", undefined, build);
        case IncrementKind.Minor:
          return pre
            ? semver.increment("preminor", pre, build)
            : semver.increment("minor", undefined, build);
        case IncrementKind.Patch:
          return pre
            ? semver.increment("prepatch", pre, build)
            : semver.increment("patch", undefined, build);
        case IncrementKind.None: {
          if (pre) {
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
