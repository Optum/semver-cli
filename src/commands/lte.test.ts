import {
  assertSpyCall,
  describe,
  it,
  stub,
} from "../../deps/std.ts";
import { Arguments } from "../../deps/yargs.ts";
import { lessOrEqual } from "./lte.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("lessOrEqual", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
  });

  it("LTE00 - v1 < v2", async () => {
    await lessOrEqual.handler(
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
      args: [1], // less or equal = true = exit code 1
    });
  });

  it("LTE01 - v1 = v2", async () => {
    await lessOrEqual.handler(
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
      args: [1], // less or equal = true = exit code 1
    });
  });

  it("LTE02 - v1 > v2", async () => {
    await lessOrEqual.handler(
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
      args: [0], // not less or equal = false = exit code 0
    });
  });

  it("LTE03 - json output less or equal", async () => {
    await lessOrEqual.handler(
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
        command: "lte",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });
});