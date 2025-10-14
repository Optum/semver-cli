import { describe, it } from "testing/bdd";
import { assertSpyCall, assertSpyCalls, stub } from "testing/mock";
import { Arguments } from "yargs";
import { sort } from "./sort.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("sort", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
  });

  it("SORT00 - sorts versions in descending order by default", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["2.0.0", "1.0.0", "3.0.0"],
        asc: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["3.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["1.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 3);
  });

  it("SORT01 - sorts versions in ascending order with -a flag", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["2.0.0", "1.0.0", "3.0.0"],
        asc: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["3.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 3);
  });

  it("SORT02 - sorts versions in descending order by default", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0", "3.0.0", "2.0.0"],
        asc: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["3.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["1.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 3);
  });

  it("SORT03 - handles prerelease versions correctly", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0", "1.0.0-alpha", "1.0.0-beta"],
        asc: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0-alpha"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["1.0.0-beta"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["1.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 3);
  });

  it("SORT04 - handles build metadata correctly", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0+build1", "1.0.0+build2", "1.0.0"],
        asc: true,
      } as unknown as Arguments & IContext,
    );
    // Build metadata doesn't affect version precedence (semver spec section 10)
    // All three versions are considered equal, so sort order is not guaranteed
    // Just verify all three are output
    assertSpyCalls(ctx.consoleLog, 3);
    const calls = [
      ctx.consoleLog.calls[0].args[0],
      ctx.consoleLog.calls[1].args[0],
      ctx.consoleLog.calls[2].args[0],
    ];
    // Verify all three versions are present (order doesn't matter)
    if (
      !calls.includes("1.0.0") ||
      !calls.includes("1.0.0+build1") ||
      !calls.includes("1.0.0+build2")
    ) {
      throw new Error(
        `Expected all three versions to be output, got: ${calls.join(", ")}`,
      );
    }
  });

  it("SORT05 - sorts complex semver versions", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0", "2.1.0", "2.0.0", "1.1.0", "1.0.1"],
        asc: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["1.0.1"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["1.1.0"],
    });
    assertSpyCall(ctx.consoleLog, 3, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 4, {
      args: ["2.1.0"],
    });
    assertSpyCalls(ctx.consoleLog, 5);
  });

  it("SORT06 - handles single version", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0"],
        asc: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 1);
  });

  it("SORT07 - handles empty versions array gracefully", async () => {
    await sort.handler(
      {
        _: [],
        versions: [],
        asc: false,
      } as unknown as Arguments & IContext,
    );
    // Should not output anything and not throw
    assertSpyCalls(ctx.consoleLog, 0);
  });

  it("SORT08 - handles null versions gracefully", async () => {
    await sort.handler(
      {
        _: [],
        versions: null,
        asc: false,
      } as unknown as Arguments & IContext,
    );
    // Should not output anything and not throw
    assertSpyCalls(ctx.consoleLog, 0);
  });

  it("SORT09 - handles undefined versions gracefully", async () => {
    await sort.handler(
      {
        _: [],
        versions: undefined,
        asc: false,
      } as unknown as Arguments & IContext,
    );
    // Should not output anything and not throw
    assertSpyCalls(ctx.consoleLog, 0);
  });

  it("SORT10 - handles space-separated versions in single string", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["2.0.0 1.0.0", "3.0.0"],
        asc: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 1, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx.consoleLog, 2, {
      args: ["3.0.0"],
    });
    assertSpyCalls(ctx.consoleLog, 3);
  });
});
