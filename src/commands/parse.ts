import type { Arguments } from "yargs";
import type { YargsInstance } from "yargs";
import * as semver from "semver";
import { InvalidVersionError } from "../errors/mod.ts";
import { printVersion, readVersionFile } from "../util/version.ts";
import { IContext } from "../context.ts";
import { output } from "./options.ts";

export const parse = {
  command: "parse [version]",
  describe: "Parse the version (or version file if not provided) and print",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("version", {
        describe: "The version to parse, or the VERSION file (default)",
      })
      .option("output", output);
  },
  async handler(args: Arguments & IContext) {
    const { version } = args;
    const result = semver.parse(version) ?? await readVersionFile();
    if (!result) {
      throw new InvalidVersionError(`${result}`);
    }
    await printVersion(args, result, true);
  },
};
