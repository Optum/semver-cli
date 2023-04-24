import {
  assertSpyCall,
  describe,
  it,
  resolvesNext,
  returnsNext,
  stub,
} from "../../../deps/std.ts";
import { Arguments } from "../../../deps/yargs.ts";
import { major } from "./major.ts";
import { testContext } from "../../util/testContext.ts";
import { IContext } from "../../context.ts";

describe("major", () => {
  const ctx0 = testContext({
    consoleLog: () => stub(console, "log"),
    cwd: () => stub(Deno, "cwd", returnsNext(["/test"])),
    writeTextFile: () => stub(Deno, "writeTextFile"),
    readTextFile: () => stub(Deno, "readTextFile", resolvesNext(["1.2.3"])),
    stat: () =>
      stub(
        Deno,
        "stat",
        resolvesNext<Deno.FileInfo>([
          Object.assign(new Error("not found"), { code: "ENOENT" }),
        ]),
      ),
  });
  it("major00", async () => {
    await major.handler(
      {
        _: [],
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["2.0.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "2.0.0\n"],
    });
  });
  it("major01", async () => {
    await major.handler(
      {
        _: [],
        pre: true,
        name: "pre",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["2.0.0-pre.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "2.0.0-pre.0\n"],
    });
  });
  it("major02", async () => {
    await major.handler(
      {
        _: [],
        build: "1",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["2.0.0+1"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "2.0.0+1\n"],
    });
  });
  it("major04", async () => {
    await major.handler(
      {
        _: [],
        pre: true,
        name: "pre",
        value: "7",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["2.0.0-pre.7"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "2.0.0-pre.7\n"],
    });
  });
  it("major05", async () => {
    await major.handler(
      {
        _: [],
        pre: true,
        name: "pre",
        value: "7",
        build: "abc123",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["2.0.0-pre.7+abc123"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "2.0.0-pre.7+abc123\n"],
    });
  });
});
