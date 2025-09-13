import { describe, it } from "testing/bdd";
import { assertSpyCall, stub } from "testing/mock";
import { Arguments } from "yargs";
import { gte } from "./gte.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("greaterOrEqual", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
  });

  it("GTE00 - v1 > v2", async () => {
    await gte.handler(
      {
        _: [],
        v1: "2.0.0",
        v2: "1.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["2.0.0 is greater than or equal to 1.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0],
    });
  });

  it("GTE01 - v1 = v2", async () => {
    await gte.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "1.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 is greater than or equal to 1.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0],
    });
  });

  it("GTE02 - v1 < v2", async () => {
    await gte.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "2.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 is not greater than or equal to 2.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });

  it("GTE03 - json output greater or equal", async () => {
    await gte.handler(
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
        command: "gte",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [0],
    });
  });
});
