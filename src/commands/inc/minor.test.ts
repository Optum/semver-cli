import {
  assertSpyCall,
  describe,
  it,
  resolvesNext,
  returnsNext,
  stub,
} from "../../../deps/std.ts";
import { Arguments } from "../../../deps/yargs.ts";
import { minor } from "./minor.ts";
import { testContext } from "../../util/testContext.ts";
import { IContext } from "../../context.ts";

const context: IContext = {
  githubOutput: undefined,
  githubDir: ".github",
  postVersionFile: "version.yml",
  hooks: {
    replace: async () => await undefined,
    patch: async () => await undefined,
    regexp: async () => await undefined,
  },
};

describe("minor", () => {
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
          Object.assign(new Error("not found"), { code: "ENOENT" }),
        ]),
      ),
  });
  it("minor00", async () => {
    await minor.handler({
      ...context,
      _: [],
    });
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.3.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.3.0\n"],
    });
  });
  it("minor01", async () => {
    await minor.handler(
      {
        _: [],
        pre: true,
        name: "pre",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.3.0-pre.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.3.0-pre.0\n"],
    });
  });
  it("minor02", async () => {
    await minor.handler(
      {
        ...context,
        _: [],
        build: "1",
      } as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.3.0+1"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.3.0+1\n"],
    });
  });
});
