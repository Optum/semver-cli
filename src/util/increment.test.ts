import { assertEquals } from "../../deps/std.ts";
import { format } from "../../deps/semver.ts";
import { increment, IncrementKind, IncrementOptions } from "./increment.ts";

const testCases: (IncrementOptions & { expected: string })[] = [
  {
    kind: IncrementKind.Major,
    version: "1.0.0",
    pre: undefined,
    expected: "2.0.0",
  },
  {
    kind: IncrementKind.Minor,
    version: "1.0.0",
    pre: undefined,
    expected: "1.1.0",
  },
  {
    kind: IncrementKind.Patch,
    version: "1.0.0",
    pre: undefined,
    expected: "1.0.1",
  },
  {
    kind: IncrementKind.None,
    version: "1.0.0",
    pre: undefined,
    expected: "1.0.0",
  },
  {
    kind: IncrementKind.Major,
    version: "1.0.0",
    pre: "pre",
    expected: "2.0.0-pre.0",
  },
  {
    kind: IncrementKind.Minor,
    version: "1.0.0",
    pre: "pre",
    expected: "1.1.0-pre.0",
  },
  {
    kind: IncrementKind.Patch,
    version: "1.0.0",
    pre: "pre",
    expected: "1.0.1-pre.0",
  },
  {
    kind: IncrementKind.None,
    version: "1.0.0",
    pre: "pre",
    expected: "1.0.0-pre.0",
  },
  {
    kind: IncrementKind.Major,
    version: "1.0.0-pre.0",
    pre: "pre",
    expected: "2.0.0-pre.1",
  },
  {
    kind: IncrementKind.Minor,
    version: "1.0.0-pre.0",
    pre: "pre",
    expected: "1.1.0-pre.1",
  },
  {
    kind: IncrementKind.Patch,
    version: "1.0.0-pre.0",
    pre: "pre",
    expected: "1.0.1-pre.1",
  },
  {
    kind: IncrementKind.None,
    version: "1.0.0-pre.0",
    pre: "pre",
    expected: "1.0.0-pre.1",
  },
  {
    kind: IncrementKind.Major,
    version: "1.0.0-pre.0",
    pre: "rc",
    expected: "2.0.0-rc.0",
  },
  {
    kind: IncrementKind.Minor,
    version: "1.0.0-pre.0",
    pre: "rc",
    expected: "1.1.0-rc.0",
  },
  {
    kind: IncrementKind.Patch,
    version: "1.0.0-pre.0",
    pre: "rc",
    expected: "1.0.1-rc.0",
  },
  {
    kind: IncrementKind.None,
    version: "1.0.0-pre.0",
    pre: "rc",
    expected: "1.0.0-rc.0",
  },
];

testCases.forEach((testCases, i) => {
  const { kind, version, pre, expected } = testCases;
  Deno.test({
    name: `INC${
      i.toLocaleString(undefined, { minimumIntegerDigits: 2 })
    } - ${version}:${kind}:${pre} -> ${expected}`,
    fn: () => {
      const result = increment({ kind, version, pre });
      assertEquals(format(result.current), expected);
    },
  });
});
