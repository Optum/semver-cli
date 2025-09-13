import { describe, it } from "testing/bdd";
import { assertSpyCall, stub } from "testing/mock";
import { Arguments } from "yargs";
import { eq } from "./eq.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";

describe("equal", () => {
  const ctx = testContext({
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
  });

  it("EQ00 - equal versions", async () => {
    await eq.handler(
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
      args: [0],
    });
  });

  it("EQ01 - not equal versions", async () => {
    await eq.handler(
      {
        _: [],
        v1: "1.0.0",
        v2: "2.0.0",
        json: false,
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["1.0.0 is not equal to 2.0.0"],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });

  it("EQ02 - json output equal", async () => {
    await eq.handler(
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
      args: [0],
    });
  });

  it("EQ03 - json output not equal", async () => {
    await eq.handler(
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
        result: 1,
        command: "eq",
      })],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });
});
