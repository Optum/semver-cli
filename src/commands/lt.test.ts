import { assertSpyCall, describe, it, stub } from "../../deps/std.ts";
import { Arguments } from "../../deps/yargs.ts";
import { less } from "./lt.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("less", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
  });

  it("LT00 - v1 < v2", async () => {
    await less.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "2.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 is less than 2.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1], // less = true = exit code 1
    });
  });

  it("LT01 - v1 = v2", async () => {
    await less.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "1.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 is equal to 1.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0], // not less = false = exit code 0
    });
  });

  it("LT02 - v1 > v2", async () => {
    await less.handler(
      {
        _: [],
        v1: "2.0.0",
        v2: "1.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["2.0.0 is greater than 1.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0], // not less = false = exit code 0
    });
  });

  it("LT03 - json output less", async () => {
    await less.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "2.0.0",
        json: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: [JSON.stringify({
        v1: "1.0.0",
        v2: "2.0.0",
        result: -1,
        command: "lt",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });
});
