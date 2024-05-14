import {
  assertRejects,
  assertSpyCall,
  assertSpyCalls,
  describe,
  it,
  resolvesNext,
  returnsNext,
  stub,
} from "../../deps/std.ts";
import { Arguments } from "../../deps/yargs.ts";
import { set } from "./set.ts";
import { testContext } from "../util/testContext.ts";
import { IContext } from "../context.ts";
import { parse } from "../../deps/semver.ts";

describe("set", () => {
  const hooks = {
    patch: async () => await undefined,
    replace: async () => await undefined,
  };
  const ctx0 = testContext({
    consoleLog: () => stub(console, "log"),
    cwd: () => stub(Deno, "cwd", returnsNext(["/test"])),
    toObject: () => stub(Deno.env, "toObject", returnsNext([{}])),
    get: () => stub(Deno.env, "get", returnsNext(["false"])),
    writeTextFile: () => stub(Deno, "writeTextFile"),
  });
  describe("without posthooks", () => {
    const ctx1 = testContext({
      stat: () => stub(Deno, "stat", resolvesNext([{} as Deno.FileInfo])),
      readTextFile: () =>
        stub(Deno, "readTextFile", resolvesNext(["1.0.0", ""])),
      patch: () => stub(hooks, "patch"),
      replace: () => stub(hooks, "replace"),
    });
    it("SET00", async () => {
      await set.handler(
        {
          _: [],
          current: "1.2.3",
          hooks,
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["1.2.3"],
      });
      assertSpyCall(ctx0.writeTextFile, 0, {
        args: ["VERSION", "1.2.3\n"],
      });
    });
    it("SET01", async () => {
      await set.handler(
        {
          _: [],
          current: undefined,
          hooks,
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["1.0.0"],
      });
      assertSpyCalls(ctx1.patch, 0);
      assertSpyCalls(ctx1.replace, 0);
      assertSpyCalls(ctx0.writeTextFile, 1);
    });
  });
  describe("without version file", () => {
    const notfound = new Error("not found");
    // deno-lint-ignore no-explicit-any
    (notfound as any).code = "ENOENT";
    const ctx1 = testContext({
      stat: () =>
        stub(Deno, "stat", resolvesNext<Deno.FileInfo>([notfound, notfound])),
      readTextFile: () => stub(Deno, "readTextFile", resolvesNext([""])),
      patch: () => stub(hooks, "patch"),
      replace: () => stub(hooks, "replace"),
    });
    it("SET06", async () => {
      await set.handler(
        {
          _: [],
          current: "1.2.3",
          hooks,
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["1.2.3"],
      });
      assertSpyCall(ctx0.writeTextFile, 0, {
        args: ["VERSION", "1.2.3\n"],
      });
    });
    it("SET07", async () => {
      await set.handler(
        {
          _: [],
          current: undefined,
          hooks,
          config: "version.yml",
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["0.1.0"],
      });
      assertSpyCalls(ctx1.patch, 0);
      assertSpyCalls(ctx1.replace, 0);
      assertSpyCalls(ctx0.writeTextFile, 1);
    });
  });

  describe("with an invalid version file", () => {
    const notfound = new Error("not found");
    // deno-lint-ignore no-explicit-any
    (notfound as any).code = "ENOENT";
    it("SET08", async () => {
      await assertRejects(async () => {
        await set.handler(
          {
            _: [],
            current: "1.2.3",
            hooks,
            config: "version.yml",
          } as unknown as Arguments & IContext,
        );
      });
    });
  });
  describe("patch with csproj posthook", () => {
    const ctx1 = testContext({
      stat: () => stub(Deno, "stat", resolvesNext([{} as Deno.FileInfo])),
      readTextFile: () =>
        stub(
          Deno,
          "readTextFile",
          resolvesNext([
            "1.0.0",
            "on:\n  post:\n    - kind: patch\n      file: src/test.csproj\n",
          ]),
        ),
      patch: () => stub(hooks, "patch"),
    });
    it("SET02", async () => {
      await set.handler(
        {
          _: [],
          current: "1.2.3",
          hooks,
          config: "version.yml",
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["Invoking post_version hook..."],
      });
      assertSpyCall(ctx0.consoleLog, 1, {
        args: ["1.2.3"],
      });
      assertSpyCall(ctx0.writeTextFile, 0, {
        args: ["VERSION", "1.2.3\n"],
      });
      assertSpyCall(ctx1.patch, 0, {
        args: [
          "src/test.csproj",
          parse("1.2.3"),
        ],
      });
    });
    it("SET03", async () => {
      await set.handler(
        {
          _: [],
          current: undefined,
          hooks,
          config: "version.yml",
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["Invoking post_version hook..."],
      });
      assertSpyCall(ctx0.consoleLog, 1, {
        args: ["1.0.0"],
      });
      assertSpyCalls(ctx0.writeTextFile, 1);
      assertSpyCall(ctx1.patch, 0, {
        args: [
          "src/test.csproj",
          parse("1.0.0"),
        ],
      });
    });
  });
  describe("patch with package.json posthook", () => {
    // todo: implement this feature...
    it.ignore("not yet implemented", () => {});
  });
  describe("replace posthook", () => {
    const ctx1 = testContext({
      stat: () => stub(Deno, "stat", resolvesNext([{} as Deno.FileInfo])),
      readTextFile: () =>
        stub(
          Deno,
          "readTextFile",
          resolvesNext([
            "1.0.0",
            "on:\n  post:\n    - kind: replace\n      file: src/info.ts\n",
          ]),
        ),
      replace: () => stub(hooks, "replace"),
    });
    it("SET04", async () => {
      await set.handler(
        {
          _: [],
          current: "1.2.3",
          hooks,
          config: "version.yml",
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["Invoking post_version hook..."],
      });
      assertSpyCall(ctx0.consoleLog, 1, {
        args: ["1.2.3"],
      });
      assertSpyCall(ctx0.writeTextFile, 0, {
        args: ["VERSION", "1.2.3\n"],
      });
      assertSpyCall(ctx1.replace, 0, {
        args: [
          "src/info.ts",
          parse("1.0.0"),
          parse("1.2.3"),
        ],
      });
    });
    it("SET05", async () => {
      await set.handler(
        {
          _: [],
          current: undefined,
          hooks,
          config: "version.yml",
        } as unknown as Arguments & IContext,
      );
      assertSpyCall(ctx0.consoleLog, 0, {
        args: ["Invoking post_version hook..."],
      });
      assertSpyCall(ctx0.consoleLog, 1, {
        args: ["1.0.0"],
      });
      assertSpyCalls(ctx0.writeTextFile, 1);
      assertSpyCall(ctx1.replace, 0, {
        args: [
          "src/info.ts",
          parse("1.0.0"),
          parse("1.0.0"),
        ],
      });
    });
  });
});
