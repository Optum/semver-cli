import { YargsInstance } from "../../deps/yargs.ts";
import { major, minor, none, patch } from "./get/mod.ts";
import {
  build,
  config,
  json,
  output,
  prerelease,
  prereleaseName,
  prereleaseValue,
} from "./options.ts";

export const get = {
  command: "get",
  describe: "Get the version",
  builder: (yargs: YargsInstance) =>
    yargs
      .option("config", config)
      .option("output", output)
      .option("json", json)
      .option("build", build)
      .option("pre", prerelease)
      .option("name", prereleaseName)
      .option("value", prereleaseValue)
      .command(major)
      .command(minor)
      .command(patch)
      .command(none)
      .strictCommands()
      .demandCommand(1),
};
