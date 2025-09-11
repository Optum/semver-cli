import type { Arguments } from "yargs";
import type { YargsInstance } from "yargs";
import * as semver from "semver";
import { InvalidVersionError } from "../errors/mod.ts";
import { printVersion, readVersionFile } from "../util/version.ts";
import { IContext } from "../context.ts";
import { output } from "./options.ts";

export const parse = {
  command: "parse [value]",
  describe: "Parse the version and print as JSON",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("value", {
        describe: "The version to parse, or the VERSION file (default)",
      })
      .option("output", output);
  },
  async handler(args: Arguments & IContext) {
    const { value } = args;
    const current = value ?? await readVersionFile();
    const result = semver.parse(current as string);
    if (!result) {
      throw new InvalidVersionError(`${current}`);
    }
    await printVersion(args, result, true);
  },
};
