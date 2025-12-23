import { describe, it } from "testing/bdd";
import { assertEquals } from "@std/assert";
import { build, config, json, output, prerelease } from "./options.ts";

describe("options", () => {
  it("OPT00 - config option", () => {
    assertEquals(config.alias, "c");
    assertEquals(config.type, "string");
    assertEquals(config.description, "Path to config file");
    assertEquals(config.example, "version.yml");
    assertEquals(config.default, undefined);
  });

  it("OPT01 - output option", () => {
    assertEquals(output.alias, "o");
    assertEquals(output.type, "string");
    assertEquals(
      output.description,
      "Outputs version as key value pairs to output file",
    );
    assertEquals(output.example, "$GITHUB_OUTPUT");
    assertEquals(output.default, undefined);
  });

  it("OPT02 - json option", () => {
    assertEquals(json.alias, "j");
    assertEquals(json.type, "flag");
    assertEquals(json.description, "Output comparison result as JSON");
  });

  it("OPT03 - build option", () => {
    assertEquals(build.alias, "b");
    assertEquals(build.type, "string");
    assertEquals(build.description, "Build metadata");
    assertEquals(build.example, "1234.abc");
    assertEquals(build.default, undefined);
  });

  it("OPT04 - prerelease option", () => {
    assertEquals(prerelease.alias, "p");
    assertEquals(prerelease.type, "string");
    assertEquals(prerelease.description, "Include prerelease");
  });
});
