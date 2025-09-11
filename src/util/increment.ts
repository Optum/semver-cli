import { format, increment as inc, parse, SemVer } from "semver";
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

  const semver = parse(typeof version === "string" ? version : format(version));
  if (!semver) {
    throw new InvalidVersionError(`${version}`);
  }

  return {
    previous: semver,
    current: (() => {
      switch (kind) {
        case IncrementKind.Major:
          // Use JSR @std/semver inc function when possible, only customize for specific prerelease+value cases
          return pre && value
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment major and set a specific prerelease value (e.g., alpha.5)
              ...inc(semver, "major", { build }),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "premajor", { prerelease: pre, build }) // Use inc function for standard prerelease increment
            : inc(semver, "major", { build }); // Use inc function for standard major increment
        case IncrementKind.Minor:
          return pre && value !== undefined
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment minor and set a specific prerelease value (e.g., beta.3)
              ...inc(semver, "minor", { build }),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "preminor", { prerelease: pre, build }) // Use inc function for standard prerelease increment
            : inc(semver, "minor", { build }); // Use inc function for standard minor increment
        case IncrementKind.Patch:
          return pre && value
            ? {
              // Custom logic needed: JSR @std/semver inc doesn't support setting specific prerelease values
              // We need to increment patch and set a specific prerelease value (e.g., rc.2)
              ...inc(semver, "patch", { build }),
              prerelease: [...pre.split("."), parseInt(value)],
            }
            : pre
            ? inc(semver, "prepatch", { prerelease: pre, build }) // Use inc function for standard prerelease increment
            : inc(semver, "patch", { build }); // Use inc function for standard patch increment
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
            // Custom logic needed: JSR @std/semver inc with "prerelease" for none increments version to patch
            // but we want to keep the same version and just add prerelease or increment existing prerelease
            if (semver.prerelease && semver.prerelease.length > 0) {
              // Already has prerelease, increment it but keep the same version
              const currentPre = semver.prerelease;
              if (
                currentPre.length > 0 &&
                typeof currentPre[currentPre.length - 1] === "number"
              ) {
                // Increment the numeric part
                return {
                  ...semver,
                  prerelease: [
                    ...currentPre.slice(0, -1),
                    (currentPre[currentPre.length - 1] as number) + 1,
                  ],
                };
              } else {
                // Add numeric part
                return {
                  ...semver,
                  prerelease: [...currentPre, 1],
                };
              }
            } else {
              // No existing prerelease, add new one
              return {
                ...semver,
                prerelease: [pre, 0],
              };
            }
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
