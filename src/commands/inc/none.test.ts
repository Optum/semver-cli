import {
  assertSpyCall,
  describe,
  it,
  resolvesNext,
  returnsNext,
  stub,
} from "../../../deps/std.ts";
import { Arguments } from "../../../deps/yargs.ts";
import { none } from "./none.ts";
import { testContext } from "../../util/testContext.ts";
import { IContext } from "../../context.ts";

describe("none", () => {
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
  it("none00", async () => {
    await none.handler(
      {
        _: [],
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.3"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.3\n"],
    });
  });
  it("none01", async () => {
    await none.handler(
      {
        _: [],
        pre: true,
        name: "pre",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.3-pre.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.3-pre.0\n"],
    });
  });
  it("none02", async () => {
    await none.handler(
      {
        _: [],
        build: "1",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.3+1"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.3+1\n"],
    });
  });
});
