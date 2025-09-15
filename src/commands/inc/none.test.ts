import { describe, it } from "testing/bdd";
import { assertSpyCall, resolvesNext, returnsNext, stub } from "testing/mock";
import type { Arguments } from "yargs";
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
          Object.assign(new Deno.errors.NotFound("not found")),
          Object.assign(new Deno.errors.NotFound("not found")),
        ]),
      ),
  });
  // it("none00", async () => {
  //   await none.handler(
  //     {
  //       _: [],
  //     } as unknown as Arguments & IContext,
  //   );
  //   assertSpyCall(ctx0.consoleLog, 0, {
  //     args: ["1.2.3"],
  //   });
  //   assertSpyCall(ctx0.writeTextFile, 0, {
  //     args: ["VERSION", "1.2.3\n"],
  //   });
  // });
  // it("none01", async () => {
  //   await none.handler(
  //     {
  //       _: [],
  //       prerelease: "pr",
  //     } as unknown as Arguments & IContext,
  //   );
  //   assertSpyCall(ctx0.consoleLog, 0, {
  //     args: ["1.2.3-pr.0"],
  //   });
  //   assertSpyCall(ctx0.writeTextFile, 0, {
  //     args: ["VERSION", "1.2.3-pr.0\n"],
  //   });
  // });
  // it("none02", async () => {
  //   await none.handler(
  //     {
  //       _: [],
  //       build: "1",
  //     } as unknown as Arguments & IContext,
  //   );
  //   assertSpyCall(ctx0.consoleLog, 0, {
  //     args: ["1.2.3+1"],
  //   });
  //   assertSpyCall(ctx0.writeTextFile, 0, {
  //     args: ["VERSION", "1.2.3+1\n"],
  //   });
  // });
  // it("none03", async () => {
  //   await none.handler(
  //     {
  //       _: [],
  //       prerelease: "pr",
  //     } as unknown as Arguments & IContext,
  //   );
  //   assertSpyCall(ctx0.consoleLog, 0, {
  //     args: ["1.2.3-pr.0"],
  //   });
  //   assertSpyCall(ctx0.writeTextFile, 0, {
  //     args: ["VERSION", "1.2.3-pr.0\n"],
  //   });
  // });
  // it("none04", async () => {
  //   await none.handler(
  //     {
  //       _: [],
  //       prerelease: "pr",
  //       build: "abc.123",
  //     } as unknown as Arguments & IContext,
  //   );
  //   assertSpyCall(ctx0.consoleLog, 0, {
  //     args: ["1.2.3-pr.0+abc.123"],
  //   });
  //   assertSpyCall(ctx0.writeTextFile, 0, {
  //     args: ["VERSION", "1.2.3-pr.0+abc.123\n"],
  //   });
  // });
  it("none05", async () => {
    await none.handler(
      {
        _: [],
        prerelease: "pr.1",
        build: "abc.123",
      } as unknown as Arguments & IContext,
    );
    assertSpyCall(ctx0.consoleLog, 0, {
      args: ["1.2.3-pr.1+abc.123"],
    });
    assertSpyCall(ctx0.writeTextFile, 0, {
      args: ["VERSION", "1.2.3-pr.1+abc.123\n"],
    });
  });
});
