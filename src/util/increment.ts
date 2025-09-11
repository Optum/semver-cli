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
  let semver: SemVer;
  
  if (typeof version === "string") {
    const parsed = parse(version);
    if (!parsed) {
      throw new InvalidVersionError(version);
    }
    semver = parsed;
  } else {
    semver = version;
  }
  return {
    previous: semver,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          if (pre && value) {
            const newVer = inc(semver, "major");
            return {
              ...newVer,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            return inc(semver, "premajor");
          } else {
            return inc(semver, "major");
          }
        case IncrementKind.Minor:
          if (pre && value !== undefined) {
            const newVer = inc(semver, "minor");
            return {
              ...newVer,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            return inc(semver, "preminor");
          } else {
            return inc(semver, "minor");
          }
        case IncrementKind.Patch:
          if (pre && value) {
            const newVer = inc(semver, "patch");
            return {
              ...newVer,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            return inc(semver, "prepatch");
          } else {
            return inc(semver, "patch");
          }
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
            return inc(semver, "prerelease");
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
