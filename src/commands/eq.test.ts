import { assertSpyCall, describe, it, stub } from "../../deps/std.ts";
import { Arguments } from "../../deps/yargs.ts";
import { equal } from "./eq.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("equal", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
  });

  it("EQ00 - equal versions", async () => {
    await equal.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "1.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 and 1.0.0 are equal"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1], // equal = true = exit code 1
    });
  });

  it("EQ01 - not equal versions", async () => {
    await equal.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "2.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 and 2.0.0 are not equal"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0], // not equal = false = exit code 0
    });
  });

  it("EQ02 - json output equal", async () => {
    await equal.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "1.0.0",
        json: true,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: [JSON.stringify({
        v1: "1.0.0",
        v2: "1.0.0",
        result: 0,
        command: "eq",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });

  it("EQ03 - json output not equal", async () => {
    await equal.handler(
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
        command: "eq",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0],
    });
  });
});
