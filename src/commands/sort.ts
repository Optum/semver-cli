import { Arguments, YargsInstance } from "yargs";
import { compare, parse } from "semver";
import { InvalidVersionError } from "../errors/mod.ts";
import { IContext } from "../context.ts";

export const sort = {
  command: "sort [versions..]",
  describe: "Sort semantic versions",
  builder(yargs: YargsInstance) {
    return yargs
      .positional("versions", {
        describe: "Versions to sort",
        type: "string",
        array: true,
      })
      .option("asc", {
        alias: "a",
        type: "boolean",
        description: "Sort in ascending order",
        default: false,
      })
      .option("desc", {
        alias: "d",
        type: "boolean",
        description: "Sort in descending order (default)",
        default: false,
      });
  },
  async handler(args: Arguments & IContext) {
    const { versions, asc, desc } = args;
    let versionList: string[] = [];

    // Check if we should read from stdin
    // The main.ts filters out "--" from args, so we check if "--" was in the original Deno.args
    const hasStdinFlag = Deno.args.includes("--");

    if (hasStdinFlag) {
      // Read from stdin
      const decoder = new TextDecoder();
      const data = await Deno.stdin.readable;
      const reader = data.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
        }
      } finally {
        reader.releaseLock();
      }

      versionList = buffer
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
    } else if (versions === null || versions === undefined) {
      versionList = [];
    } else if (Array.isArray(versions)) {
      versionList = versions;
    } else {
      throw new Error("Invalid versions argument");
    }

    // If no versions provided, exit early with success
    if (versionList.length === 0) {
      return;
    }

    // Parse and validate all versions
    const parsedVersions = versionList.map((v) => {
      const parsed = parse(v);
      if (!parsed) {
        throw new InvalidVersionError(v);
      }
      return { original: v, parsed };
    });

    // Sort versions using semver compare
    parsedVersions.sort((a, b) => compare(a.parsed, b.parsed));

    // Determine sort order
    // Default is descending unless -a/--asc is explicitly set
    const isDescending = desc || (!asc && !desc);

    // Reverse if descending
    if (isDescending) {
      parsedVersions.reverse();
    }

    // Output sorted versions, one per line
    parsedVersions.forEach((v) => console.log(v.original));
  },
};
