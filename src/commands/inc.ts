import { YargsInstance } from "../../deps/yargs.ts";
import { major, minor, none, patch } from "./inc/mod.ts";

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

const prereleaseValueOption = {
  alias: "v",
  type: "number",
  description: "Prerelease number value",
  default: undefined
}

export const inc = {
  command: "inc",
  describe: "Increment the version",
  builder: (yargs: YargsInstance) =>
    yargs
      .option("build", buildOption)
      .option("pre", prereleaseOption)
      .option("name", prereleaseNameOption)
      .option("value", prereleaseValueOption)
      .command(major)
      .command(minor)
      .command(patch)
      .command(none)
      .strictCommands()
      .demandCommand(1),
};
