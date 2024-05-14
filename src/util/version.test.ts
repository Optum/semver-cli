import { format, parse } from "../../deps/semver.ts";
import {
  assertEquals,
  AssertionError,
  assertRejects,
  assertSpyCall,
  resolvesNext,
  stub,
} from "../../deps/std.ts";
import { IContext } from "../context.ts";
import { printVersion, readVersionFile, writeVersionFile } from "./version.ts";

Deno.test({
  name: "VER00",
  fn: async () => {
    const readTextFile = stub(Deno, "readTextFile", resolvesNext(["1.0.0"]));
    try {
      const version = await readVersionFile();
      assertEquals(format(version), "1.0.0");
    } finally {
      readTextFile.restore();
    }
  },
});

Deno.test({
  name: "VER01",
  fn: async () => {
    const err = new Error("not found");
    // deno-lint-ignore no-explicit-any
    (err as any).code = "ENOENT";
    const readTextFile = stub(
      Deno,
      "readTextFile",
      resolvesNext<string>([err]),
    );
    try {
      const version = await readVersionFile();
      assertEquals(format(version), "0.1.0");
    } finally {
      readTextFile.restore();
    }
  },
});

Deno.test({
  name: "VER02",
  fn: async () => {
    const err = new AssertionError("testing");
    // deno-lint-ignore no-explicit-any
    (err as any).code = "TEST";
    const readTextFile = stub(
      Deno,
      "readTextFile",
      resolvesNext<string>([err]),
    );
    try {
      await assertRejects(async () => await readVersionFile(), AssertionError);
    } finally {
      readTextFile.restore();
    }
  },
});

Deno.test({
  name: "VER03",
  fn: async () => {
    const readTextFile = stub(
      Deno,
      "readTextFile",
      resolvesNext(["   1.0.0\n\t  "]),
    );
    try {
      const version = await readVersionFile();
      assertEquals(format(version), "1.0.0");
    } finally {
      readTextFile.restore();
    }
  },
});

Deno.test({
  name: "VER04",
  fn: async () => {
    const consoleLog = stub(console, "log");
    try {
      const version = parse("1.2.3");
      await printVersion({} as IContext, version);
      assertSpyCall(consoleLog, 0, {
        args: ["1.2.3"],
      });
    } finally {
      consoleLog.restore();
    }
  },
});

Deno.test({
  name: "VER05",
  fn: async () => {
    const consoleLog = stub(console, "log");
    try {
      const version = parse("1.2.3-pre.0+1");
      await printVersion({} as IContext, version);
      assertSpyCall(consoleLog, 0, {
        args: ["1.2.3-pre.0+1"],
      });
    } finally {
      consoleLog.restore();
    }
  },
});

Deno.test({
  name: "VER06",
  fn: async () => {
    const consoleLog = stub(console, "log");
    try {
      const version = parse("1.2.3");
      await printVersion({} as IContext, version);
      assertSpyCall(consoleLog, 0, {
        args: ["1.2.3"],
      });
    } finally {
      consoleLog.restore();
    }
  },
});

Deno.test({
  name: "VER07",
  fn: async () => {
    const writeTextFile = stub(Deno, "writeTextFile");
    try {
      const version = parse("1.2.3");
      await writeVersionFile(version);
      assertSpyCall(writeTextFile, 0, {
        args: ["VERSION", "1.2.3\n"],
      });
    } finally {
      writeTextFile.restore();
    }
  },
});

Deno.test({
  name: "VER08",
  fn: async () => {
    const consoleLog = stub(console, "log");
    const mkdirp = stub(Deno, "mkdir", resolvesNext([undefined]));
    const appendTextFile = stub(
      Deno,
      "writeTextFile",
      resolvesNext(new Array(10)),
    );
    try {
      const version = parse("1.2.3-pre.0+1");
      await printVersion({ output: "/test/output" } as IContext, version);
      assertSpyCall(appendTextFile, 0, {
        args: [
          "/test/output",
          "version=1.2.3-pre.0+1\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 1, {
        args: [
          "/test/output",
          "sv_major=1\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 2, {
        args: [
          "/test/output",
          "minor=2\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 3, {
        args: [
          "/test/output",
          "patch=3\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 4, {
        args: [
          "/test/output",
          "prerelease=pre.0\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 5, {
        args: [
          "/test/output",
          "build=1\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 6, {
        args: [
          "/test/output",
          "def=1.2.3-pre.0+1\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 7, {
        args: [
          "/test/output",
          "dotnet=1.2.3-pre.0-1\n",
          { create: true, append: true },
        ],
      });
      assertSpyCall(appendTextFile, 8, {
        args: [
          "/test/output",
          "docker=1.2.3-pre.0-1\n",
          { create: true, append: true },
        ],
      });
    } finally {
      mkdirp.restore();
      consoleLog.restore();
      appendTextFile.restore();
    }
  },
});
