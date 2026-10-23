import { describe, it } from "testing/bdd";
import { assertSpyCall, stub } from "testing/mock";
import { testContext } from "../util/testContext.ts";
import { gitClientFactory, gitLatest } from "./git-latest.ts";
import { type ConventionalGitClient } from "@conventional-changelog/git-client";

describe("git-latest command", () => {
  const ctx = testContext({
    consoleError: () => stub(console, "error"),
    consoleLog: () => stub(console, "log"),
    exit: () => stub(Deno, "exit"),
    clientFactory: () => stub(gitClientFactory, "create"),
  });

  it("gets the most recent parseable git tag", async () => {
    ctx.clientFactory.restore();
    ctx.clientFactory = stub(
      gitClientFactory,
      "create",
      () =>
        ({
          getVersionFromTags: () => "0.1.0",
        }) as unknown as ConventionalGitClient,
    );
    const { handler } = gitLatest;

    await handler({});

    assertSpyCall(ctx.clientFactory, 0, {
      args: [],
    });
    assertSpyCall(ctx.consoleLog, 0, {
      args: ["0.1.0"],
    });
  });

  it("exits 1 when there is an error", async () => {
    ctx.clientFactory.restore();
    ctx.clientFactory = stub(
      gitClientFactory,
      "create",
      () =>
        ({
          getVersionFromTags: () => {
            throw new Error("failed in a test");
          },
        }) as unknown as ConventionalGitClient,
    );
    const { handler } = gitLatest;

    await handler({});

    assertSpyCall(ctx.clientFactory, 0, {
      args: [],
    });
    assertSpyCall(ctx.consoleError, 0, {
      args: ["Failed to get the latest semver git tag."],
    });
    assertSpyCall(ctx.exit, 0, {
      args: [1],
    });
  });
});
