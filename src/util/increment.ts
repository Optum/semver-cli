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

  const pre = bumpPrerelease(version.prerelease, prerelease);
  // console.log({ version, pre})

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
          return prerelease
            ? {
              ...inc(version, "pre", { prerelease, build }),
              prerelease: pre,
            }
            : {
              ...version,
              prerelease: version.prerelease ?? [],
              build: build ? build.split(".") : version.build ?? [],
            };
        default:
          throw new Error(`Unknown increment kind: ${kind}`);
      }
    })(),
  };
}

const NUMERIC_IDENTIFIER = "0|[1-9]\\d*";
const NUMERIC_IDENTIFIER_REGEXP = new RegExp(`^${NUMERIC_IDENTIFIER}$`);
export function isValidNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    !Number.isNaN(value) &&
    (!Number.isFinite(value) ||
      (0 <= value && value <= Number.MAX_SAFE_INTEGER))
  );
}

export function parsePrerelease(prerelease: string) {
  return prerelease
    .split(".")
    .filter(Boolean)
    .map((id: string) => {
      if (NUMERIC_IDENTIFIER_REGEXP.test(id)) {
        const number = Number(id);
        if (isValidNumber(number)) return number;
      }
      return id;
    });
}

function bumpPrereleaseNumber(prerelease: ReadonlyArray<string | number> = []) {
  const values = [...prerelease];

  let index = values.length;
  while (index >= 0) {
    const value = values[index];
    if (typeof value === "number") {
      values[index] = value + 1;
      break;
    }
    index -= 1;
  }
  // if no number was bumped
  if (index === -1) values.push(0);

  return values;
}

function bumpPrerelease(
  prerelease: ReadonlyArray<string | number> = [],
  identifier: string | undefined,
) {
  const prereleaseValues = bumpPrereleaseNumber(prerelease);
  if (!identifier) return prereleaseValues;

  const identifierValues = parsePrerelease(identifier);
  // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
  // 1.2.0-beta.foobar or 1.2.0-beta bumps to 1.2.0-beta.0
  if (
    prereleaseValues[0] !== identifierValues[0] ||
    isNaN(prereleaseValues[1] as number) ||
    !isNaN(identifierValues[1] as number)
  ) {
    return [identifierValues[0], identifierValues[1] ?? 0];
  } else {
    return prereleaseValues;
  }
}
