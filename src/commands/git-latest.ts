import { type Arguments, type IContext } from "yargs";
import * as semver from "semver";
import { printVersion } from "../util/version.ts";
import { ConventionalGitClient } from "@conventional-changelog/git-client";

export const gitClientFactory = {
  create() {
    return new ConventionalGitClient(Deno.cwd());
  },
};

export const gitLatest = {
  command: "git-latest",
  describe: "Get the most recent parseable git tag",
  async handler(args: Arguments & IContext) {
    const client = gitClientFactory.create();

    try {
      const isShallow =
        (await client.exec("rev-parse", "--is-shallow-repository")) === "true";
      await client.fetch({
        all: true,
        tags: true,
        ...(isShallow ? { unshallow: true } : {}),
      });
      const version = await client.getVersionFromTags();
      if (!version) {
        throw new Error("Unable to resolve version from tags");
      }
      await printVersion(args, semver.parse(version), args.json);
    } catch (e) {
      console.error("Failed to get the latest semver git tag.");
      console.error(e);
      Deno.exit(1);
    }
  },
};
