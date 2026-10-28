import type { Arguments } from "yargs";
import type { YargsInstance } from "yargs";
import * as semver from "semver";
import { InvalidVersionError } from "../errors/mod.ts";
import { printVersion, readCurrentVersion } from "../util/version.ts";
import { IContext } from "../context.ts";
import { config, json, output } from "./options.ts";

export const parse = {
  command: "parse [value]",
  describe: "Parse the version and print",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("value", {
        describe: "The version to parse, or the current version (default)",
      })
      .option("output", output)
      .option("config", config)
      .option("json", json);
  },
  async handler(args: Arguments & IContext) {
    const { value } = args;
    const result = value ? semver.parse(value) : await readCurrentVersion(args);
    if (!result) {
      throw new InvalidVersionError(`${result}`);
    }
    await printVersion(args, result, args.json);
  },
};
