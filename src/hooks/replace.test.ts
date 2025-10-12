import { describe, it } from "testing/bdd";
import { assertSpyCall, stub } from "testing/mock";
import { parse } from "semver";
import { replace } from "./replace.ts";

describe("replace", () => {
  it("should log formatted version strings", async () => {
    const consoleLogStub = stub(console, "log");
    const readTextFileStub = stub(
      Deno,
      "readTextFile",
      () => Promise.resolve("version 1.0.0"),
    );
    const writeTextFileStub = stub(
      Deno,
      "writeTextFile",
      () => Promise.resolve(),
    );

    try {
      await replace("test.txt", parse("1.0.0")!, parse("1.2.3")!);

      // Verify console.log was called with formatted strings, not [object Object]
      assertSpyCall(consoleLogStub, 0, {
        args: ["replacing 1.0.0 -> 1.2.3 in test.txt"],
      });

      // Verify file operations
      assertSpyCall(readTextFileStub, 0, {
        args: ["test.txt"],
      });
      assertSpyCall(writeTextFileStub, 0, {
        args: ["test.txt", "version 1.2.3"],
      });
    } finally {
      consoleLogStub.restore();
      readTextFileStub.restore();
      writeTextFileStub.restore();
    }
  });
});
