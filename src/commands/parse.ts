import { Arguments, YargsInstance } from "../../deps/yargs.ts";
import { parse as parseVersion } from "../../deps/semver.ts";
import { InvalidVersionError } from "../errors/mod.ts";
import { printVersion, readVersionFile } from "../util/version.ts";
import { IContext } from "../context.ts";

export const parse = {
  command: "parse [value]",
  describe: "Parse the version and print as JSON",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("value", {
        describe: "The version to parse, or the VERSION file (default)",
      });
  },
  async handler(args: Arguments & IContext) {
    const { value } = args;
    const current = value ?? await readVersionFile();
    const semver = parseVersion(current);
    if (!semver) {
      throw new InvalidVersionError(current);
    }
    await printVersion(args, semver, true);
  },
};
