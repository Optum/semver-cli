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
            // Increment major and set specific prerelease value
            return {
              major: semver.major + 1,
              minor: 0,
              patch: 0,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            // Increment major and handle prerelease
            const currentPre = semver.prerelease?.[0];
            if (currentPre === pre && semver.prerelease?.[1] !== undefined) {
              // Same prerelease name, increment both major and prerelease counter
              const currentNum = typeof semver.prerelease[1] === "number" 
                ? semver.prerelease[1] + 1 
                : parseInt(String(semver.prerelease[1])) + 1;
              return {
                major: semver.major + 1,
                minor: 0,
                patch: 0,
                prerelease: [pre, currentNum],
                build: [],
              };
            } else {
              // Different prerelease name or no existing prerelease
              return {
                major: semver.major + 1,
                minor: 0,
                patch: 0,
                prerelease: [pre, 0],
                build: [],
              };
            }
          } else {
            return inc(semver, "major");
          }
        case IncrementKind.Minor:
          if (pre && value !== undefined) {
            // Increment minor and set specific prerelease value
            return {
              major: semver.major,
              minor: semver.minor + 1,
              patch: 0,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            // Increment minor and handle prerelease
            const currentPre = semver.prerelease?.[0];
            if (currentPre === pre && semver.prerelease?.[1] !== undefined) {
              // Same prerelease name, increment both minor and prerelease counter
              const currentNum = typeof semver.prerelease[1] === "number" 
                ? semver.prerelease[1] + 1 
                : parseInt(String(semver.prerelease[1])) + 1;
              return {
                major: semver.major,
                minor: semver.minor + 1,
                patch: 0,
                prerelease: [pre, currentNum],
                build: [],
              };
            } else {
              // Different prerelease name or no existing prerelease
              return {
                major: semver.major,
                minor: semver.minor + 1,
                patch: 0,
                prerelease: [pre, 0],
                build: [],
              };
            }
          } else {
            return inc(semver, "minor");
          }
        case IncrementKind.Patch:
          if (pre && value) {
            // Increment patch and set specific prerelease value
            return {
              major: semver.major,
              minor: semver.minor,
              patch: semver.patch + 1,
              prerelease: [...pre.split("."), parseInt(value)],
              build: build ? build.split(".") : [],
            };
          } else if (pre) {
            // Increment patch and handle prerelease
            const currentPre = semver.prerelease?.[0];
            if (currentPre === pre && semver.prerelease?.[1] !== undefined) {
              // Same prerelease name, increment both patch and prerelease counter
              const currentNum = typeof semver.prerelease[1] === "number" 
                ? semver.prerelease[1] + 1 
                : parseInt(String(semver.prerelease[1])) + 1;
              return {
                major: semver.major,
                minor: semver.minor,
                patch: semver.patch + 1,
                prerelease: [pre, currentNum],
                build: [],
              };
            } else {
              // Different prerelease name or no existing prerelease
              return {
                major: semver.major,
                minor: semver.minor,
                patch: semver.patch + 1,
                prerelease: [pre, 0],
                build: [],
              };
            }
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
            // Check if we're changing prerelease name or incrementing existing
            const currentPre = semver.prerelease?.[0];
            if (currentPre && currentPre !== pre) {
              // Changing prerelease name, reset to 0
              return {
                ...semver,
                prerelease: [pre, 0],
              };
            } else if (currentPre === pre) {
              // Same prerelease name, increment
              return inc(semver, "prerelease");
            } else {
              // No existing prerelease, add new one
              return {
                ...semver,
                prerelease: [pre, 0],
              };
            }
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
