import { assertEquals } from "assert";
import { format, parse } from "semver";
import { increment, IncrementKind, IncrementOptions } from "./increment.ts";

const testCases: (IncrementOptions & { expected: string })[] = [
  {
    kind: IncrementKind.Major,
    version: parse("1.0.0"),
    prerelease: undefined,
    expected: "2.0.0",
  },
  {
    kind: IncrementKind.Minor,
    version: parse("1.0.0"),
    prerelease: undefined,
    expected: "1.1.0",
  },
  {
    kind: IncrementKind.Patch,
    version: parse("1.0.0"),
    prerelease: undefined,
    expected: "1.0.1",
  },
  {
    kind: IncrementKind.None,
    version: parse("1.0.0"),
    prerelease: undefined,
    expected: "1.0.0",
  },
  {
    kind: IncrementKind.Major,
    version: parse("1.0.0"),
    prerelease: "pre",
    expected: "2.0.0-pre.0",
  },
  {
    kind: IncrementKind.Minor,
    version: parse("1.0.0"),
    prerelease: "pre",
    expected: "1.1.0-pre.0",
  },
  {
    kind: IncrementKind.Patch,
    version: parse("1.0.0"),
    prerelease: "pre",
    expected: "1.0.1-pre.0",
  },
  {
    kind: IncrementKind.None,
    version: parse("1.0.0"),
    prerelease: "pre",
    expected: "1.0.0-pre.0",
  },
  {
    kind: IncrementKind.Major,
    version: parse("1.0.0-pre.0"),
    prerelease: "pre",
    expected: "2.0.0-pre.1",
  },
  {
    kind: IncrementKind.Minor,
    version: parse("1.0.0-pre.0"),
    prerelease: "pre",
    expected: "1.1.0-pre.1",
  },
  {
    kind: IncrementKind.Patch,
    version: parse("1.0.0-pre.0"),
    prerelease: "pre",
    expected: "1.0.1-pre.1",
  },
  {
    kind: IncrementKind.None,
    version: parse("1.0.0-pre.0"),
    prerelease: "pre",
    expected: "1.0.0-pre.1",
  },
  {
    kind: IncrementKind.Major,
    version: parse("1.0.0-pre.0"),
    prerelease: "rc",
    expected: "2.0.0-rc.0",
  },
  {
    kind: IncrementKind.Minor,
    version: parse("1.0.0-pre.0"),
    prerelease: "rc",
    expected: "1.1.0-rc.0",
  },
  {
    kind: IncrementKind.Patch,
    version: parse("1.0.0-pre.0"),
    prerelease: "rc",
    expected: "1.0.1-rc.0",
  },
  {
    kind: IncrementKind.None,
    version: parse("1.0.0-pre.0"),
    prerelease: "rc",
    expected: "1.0.0-rc.0",
  },
];

testCases.forEach((testCases, i) => {
  const { kind, version, prerelease, expected } = testCases;
  Deno.test({
    name: `INC${i.toLocaleString(undefined, { minimumIntegerDigits: 2 })} - ${
      format(version)
    }:${kind}:${prerelease} -> ${expected}`,
    fn: () => {
      const result = increment({ kind, version, prerelease });
      assertEquals(format(result.current), expected);
    },
  });
});
