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
        desc: false,
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
        desc: false,
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

  it("SORT02 - sorts versions in descending order with -d flag", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0", "3.0.0", "2.0.0"],
        asc: false,
        desc: true,
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
        desc: false,
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
        desc: false,
      } as unknown as Arguments & IContext,
    );
    // Build metadata should not affect sort order
    assertSpyCalls(ctx.consoleLog, 3);
  });

  it("SORT05 - sorts complex semver versions", async () => {
    await sort.handler(
      {
        _: [],
        versions: ["1.0.0", "2.1.0", "2.0.0", "1.1.0", "1.0.1"],
        asc: true,
        desc: false,
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
        desc: false,
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
        desc: false,
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
        desc: false,
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
        desc: false,
      } as unknown as Arguments & IContext,
    );
    // Should not output anything and not throw
    assertSpyCalls(ctx.consoleLog, 0);
  });
});
