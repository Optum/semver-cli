import { describe, it } from "testing/bdd";
import { assertSpyCall, stub } from "testing/mock";
import { parse } from "semver";
import { patch } from "./patch.ts";

describe("patch", () => {
  it("should log formatted version string for csproj", async () => {
    const consoleLogStub = stub(console, "log");
    const readTextFileStub = stub(
      Deno,
      "readTextFile",
      () =>
        Promise.resolve(
          "<Project>\n  <PropertyGroup>\n    <Version>1.0.0</Version>\n  </PropertyGroup>\n</Project>",
        ),
    );
    const writeTextFileStub = stub(
      Deno,
      "writeTextFile",
      () => Promise.resolve(),
    );

    try {
      await patch("test.csproj", parse("1.2.3")!);

      // Verify console.log was called with formatted string, not [object Object]
      assertSpyCall(consoleLogStub, 0, {
        args: ["patching 1.2.3 in test.csproj"],
      });
    } finally {
      consoleLogStub.restore();
      readTextFileStub.restore();
      writeTextFileStub.restore();
    }
  });

  it("should log formatted version string for package.json", async () => {
    const consoleLogStub = stub(console, "log");
    const readTextFileStub = stub(
      Deno,
      "readTextFile",
      () => Promise.resolve('{"version": "1.0.0"}'),
    );
    const writeTextFileStub = stub(
      Deno,
      "writeTextFile",
      () => Promise.resolve(),
    );
    const statStub = stub(
      Deno,
      "stat",
      () => Promise.reject(new Deno.errors.NotFound()),
    );

    try {
      await patch("package.json", parse("1.2.3")!);

      // Verify console.log was called with formatted string, not [object Object]
      assertSpyCall(consoleLogStub, 0, {
        args: ["patching 1.2.3 in package.json"],
      });
    } finally {
      consoleLogStub.restore();
      readTextFileStub.restore();
      writeTextFileStub.restore();
      statStub.restore();
    }
  });
});
