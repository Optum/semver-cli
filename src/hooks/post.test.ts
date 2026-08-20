import { parse } from "semver";
import { assertEquals } from "@std/assert";
import { assertSpyCalls, resolvesNext, stub } from "testing/mock";
import * as YAML from "yaml";
import { IContext } from "../context.ts";
import { postVersionHook } from "./post.ts";

Deno.test("yml or yaml", async () => {
  const context: IContext = {
    githubDir: ".github",
    hooks: {
      patch: async () => await undefined,
      replace: async () => await undefined,
      regexp: async () => await undefined,
    },
  };
  const stubs = [
    stub(
      Deno,
      "stat",
      resolvesNext<Deno.FileInfo>([
        Object.assign(new Deno.errors.NotFound("not found")), // version.yml, nah
        {
          isFile: true,
        } as Deno.FileInfo, // version.yaml, yah
      ]),
    ),
    stub(
      Deno,
      "readTextFile",
      resolvesNext([
        "1.0.0",
        YAML.stringify({
          on: { post: [{ kind: "patch", file: "test/example.csproj" }] },
        }),
      ]),
    ),
    stub(context.hooks, "patch"),
    stub(context.hooks, "replace"),
  ];
  try {
    await postVersionHook(context, parse("1.0.0"), parse("1.2.3"));
  } finally {
    stubs.forEach((s) => s.restore());
  }
});

Deno.test("hook target file missing is a warning, not a failure", async () => {
  const notFound = new Deno.errors.NotFound(
    "No such file or directory (os error 2): readfile '.github/README.md'",
  );
  const context: IContext = {
    githubDir: ".github",
    hooks: {
      patch: async () => await undefined,
      replace: async () => await undefined,
      regexp: () => {
        throw notFound;
      },
    },
  };
  const stubs = [
    stub(
      Deno,
      "stat",
      resolvesNext<Deno.FileInfo>([
        { isFile: true } as Deno.FileInfo, // version.yml
      ]),
    ),
    stub(
      Deno,
      "readTextFile",
      resolvesNext([
        YAML.stringify({
          on: {
            post: [{
              kind: "regexp",
              file: ".github/README.md",
              pattern: "\\d+\\.\\d+\\.\\d+",
            }],
          },
        }),
      ]),
    ),
    stub(context.hooks, "patch"),
    stub(context.hooks, "replace"),
  ];
  try {
    const warnings = await postVersionHook(
      context,
      parse("1.0.0"),
      parse("1.2.3"),
    );
    assertEquals(warnings, [{
      kind: "regexp",
      file: ".github/README.md",
      reason: notFound.message,
    }]);
  } finally {
    stubs.forEach((s) => s.restore());
  }
});

Deno.test("remaining hooks still run after one hook's file is missing", async () => {
  const notFound = new Deno.errors.NotFound("not found");
  const context: IContext = {
    githubDir: ".github",
    hooks: {
      patch: async () => await undefined,
      replace: () => {
        throw notFound;
      },
      regexp: async () => await undefined,
    },
  };
  const stubs = [
    stub(
      Deno,
      "stat",
      resolvesNext<Deno.FileInfo>([
        { isFile: true } as Deno.FileInfo, // version.yml
      ]),
    ),
    stub(
      Deno,
      "readTextFile",
      resolvesNext([
        YAML.stringify({
          on: {
            post: [
              { kind: "replace", file: "missing.txt" },
              { kind: "patch", file: "test/example.csproj" },
            ],
          },
        }),
      ]),
    ),
    stub(context.hooks, "regexp"),
  ];
  const patchStub = stub(context.hooks, "patch");
  try {
    const warnings = await postVersionHook(
      context,
      parse("1.0.0"),
      parse("1.2.3"),
    );
    assertEquals(warnings.length, 1);
    assertEquals(warnings[0].file, "missing.txt");
    assertSpyCalls(patchStub, 1);
  } finally {
    patchStub.restore();
    stubs.forEach((s) => s.restore());
  }
});

Deno.test("custom config", async () => {
  const context: IContext = {
    config: ".github/version-test.yml",
    githubDir: ".github",
    hooks: {
      patch: async () => await undefined,
      replace: async () => await undefined,
      regexp: async () => await undefined,
    },
  };
  let configPath: string | URL = "";
  const stubs = [
    stub(
      Deno,
      "stat",
      resolvesNext<Deno.FileInfo>([
        { isFile: true } as Deno.FileInfo,
      ]),
    ),
    stub(
      Deno,
      "readTextFile",
      async (path: string | URL, _opts?: Deno.ReadFileOptions) => {
        configPath = path;
        return await YAML.stringify({
          on: { post: [] },
        });
      },
    ),
    stub(context.hooks, "patch"),
    stub(context.hooks, "replace"),
  ];
  try {
    await postVersionHook(context, parse("1.0.0"), parse("1.2.3"));
    assertEquals(configPath, ".github/version-test.yml");
  } finally {
    stubs.forEach((s) => s.restore());
  }
});
