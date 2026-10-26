import type { YargsInstance } from "yargs";
import { major, minor, none, patch } from "./git-latest/mod.ts";
import { build, config, json, output, prerelease } from "./options.ts";

export const gitLatest = {
  command: "git-latest",
  describe: "Get the most recent parseable git tag",
  builder: (yargs: YargsInstance) =>
    yargs
      .option("config", config)
      .option("output", output)
      .option("json", json)
      .option("prerelease", prerelease)
      .option("build", build)
      .command(major)
      .command(minor)
      .command(patch)
      .command(none)
      .strictOptions()
      .strictCommands()
      .demandCommand(1),
};
