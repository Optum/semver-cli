import {
  describe,
  it,
} from "testing/bdd";
import {
  assertSpyCall,
  resolvesNext,
  returnsNext,
  stub,
} from "testing/mock";
import type { Arguments } from "yargs";
import { patch } from "./patch.ts";
import { testContext } from "../../util/testContext.ts";
import { IContext } from "../../context.ts";

describe("patch", () => {
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
          Object.assign(new Deno.errors.NotFound("not found")),
          Object.assign(new Deno.errors.NotFound("not found")),
        ]),
      ),
  });
  it("patch00", async () => {
    await patch.handler(
      {
        _: [],
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.4"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.4\n"],
    });
  });
  it("patch01", async () => {
    await patch.handler(
      {
        _: [],
        pre: true,
        name: "pre",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.4-pre.0"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.4-pre.0\n"],
    });
  });
  it("patch02", async () => {
    await patch.handler(
      {
        _: [],
        build: "1",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.4+1"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.4+1\n"],
    });
  });
  it("patch03", async () => {
    await patch.handler(
      {
        _: [],
        pre: true,
        name: "pre",
        value: "7",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.4-pre.7"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.4-pre.7\n"],
    });
  });
  it("patch04", async () => {
    await patch.handler(
      {
        _: [],
        pre: true,
        name: "pre",
        value: "7",
        build: "abc.123",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.4-pre.7+abc.123"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.4-pre.7+abc.123\n"],
    });
  });
});
