import { YargsInstance } from "../../deps/yargs.ts";
import { major, minor, none, patch } from "./get/mod.ts";

const buildOption = {
  alias: "b",
  type: "string",
  description: "Build metadata",
  example: "1234.abc",
  default: undefined,
};

const prereleaseOption = {
  alias: "p",
  type: "flag",
  description: "Include prerelease",
};

const prereleaseNameOption = {
  alias: "n",
  type: "string",
  description: "Prerelease name",
  example: "alpha",
  default: "pre",
};

export const get = {
  command: "get",
  describe: "Get the version",
  builder: (yargs: YargsInstance) =>
    yargs
      .option("build", buildOption)
      .option("pre", prereleaseOption)
      .option("name", prereleaseNameOption)
      .command(major)
      .command(minor)
      .command(patch)
      .command(none)
      .strictCommands()
      .demandCommand(1),
};
