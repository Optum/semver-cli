import type { YargsInstance } from "yargs";
import { major, minor, none, patch } from "./inc/mod.ts";
import { build, config, json, output, prerelease } from "./options.ts";

export const inc = {
  command: "inc",
  describe: "Increment the version",
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
