import { parse } from "../../deps/semver.ts";
import { resolvesNext, stub } from "../../deps/std.ts";
import { YAML } from "../../deps/yaml.ts";
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
  stub(
    Deno,
    "stat",
    resolvesNext<Deno.FileInfo>([
      Object.assign(new Error("not found"), { code: "ENOENT" }), // version.yml, nah
      {
        isFile: true,
      } as Deno.FileInfo, // version.yaml, yah
    ]),
  );
  stub(
    Deno,
    "readTextFile",
    resolvesNext([
      "1.0.0",
      YAML.stringify({
        on: { post: [{ kind: "patch", file: "test/example.csproj" }] },
      }),
    ]),
  );
  stub(context.hooks, "patch");
  stub(context.hooks, "replace");
  await postVersionHook(context, parse("1.0.0"), parse("1.2.3"));
});
