import { assertEquals } from "@std/assert";
import { IContext } from "../context.ts";
import { getVersionSource } from "./config.ts";

Deno.test("req:version-sources-001 - source defaults to file", async () => {
  assertEquals(await getVersionSource({} as IContext), "file");
});

Deno.test("req:version-sources-003 - configuration selects Git tags", async () => {
  const config = await Deno.makeTempFile({ suffix: ".yml" });
  try {
    await Deno.writeTextFile(config, "source: git\n");
    assertEquals(await getVersionSource({ config } as IContext), "git");
  } finally {
    await Deno.remove(config);
  }
});
