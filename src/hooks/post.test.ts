import { parse } from "semver";
import { assertEquals } from "assert";
import { resolvesNext, stub } from "testing/bdd";
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
      async (path, _opts) => {
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
