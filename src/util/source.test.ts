import { assertEquals, assertStringIncludes } from "@std/assert";

const main = new URL("../../main.ts", import.meta.url).pathname;
const decoder = new TextDecoder();

async function run(cwd: string, command: string, args: string[]) {
  const result = await new Deno.Command(command, {
    args,
    cwd,
    stdout: "piped",
    stderr: "piped",
  }).output();
  const stdout = decoder.decode(result.stdout).trim();
  const stderr = decoder.decode(result.stderr).trim();
  assertEquals(
    result.code,
    0,
    `${command} ${args.join(" ")} failed: ${stderr}`,
  );
  return stdout;
}

Deno.test("req:version-sources-001 - version sources use file or Git", async () => {
  const cwd = await Deno.makeTempDir();
  const cli = (...args: string[]) =>
    run(cwd, Deno.execPath(), ["run", "--cached-only", "-A", main, ...args]);
  const git = (...args: string[]) => run(cwd, "git", args);
  try {
    await git("init", "-q");
    await git("config", "user.name", "Test");
    await git("config", "user.email", "test@example.com");
    await Deno.writeTextFile(`${cwd}/README`, "test\n");
    await git("add", "README");
    await git("commit", "-qm", "initial");

    // req:version-sources-002 - a missing file starts at the fallback version.
    assertEquals(await cli("get"), "0.1.0");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "0.1.0\n");

    await Deno.mkdir(`${cwd}/.github`);
    await Deno.writeTextFile(`${cwd}/.github/version.yml`, "source: git\n");
    // req:version-sources-003 - Git mode uses the fallback and removes VERSION.
    assertEquals(await cli("get"), "0.1.0");
    assertEquals(await exists(`${cwd}/VERSION`), false);
    await Deno.remove(`${cwd}/.github/version.yml`);

    // req:version-sources-006 - a higher tag on another branch is ignored.
    const currentBranch = await git("branch", "--show-current");
    await git("switch", "-q", "-c", "unrelated");
    await Deno.writeTextFile(`${cwd}/README`, "unrelated\n");
    await git("add", "README");
    await git("commit", "-qm", "unrelated");
    await git("tag", "v9.9.9");
    await git("switch", "-q", currentBranch);
    await git("tag", "v1.2.3");
    assertEquals(await cli("get"), "1.2.3");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "1.2.3\n");
    await Deno.writeTextFile(`${cwd}/VERSION`, "9.9.9\n");
    assertEquals(await cli("get"), "9.9.9");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "9.9.9\n");

    await Deno.writeTextFile(
      `${cwd}/.github/version.yml`,
      "source: git\non:\n  post:\n    - kind: patch\n      file: package.json\n",
    );
    await Deno.writeTextFile(`${cwd}/package.json`, '{"version":"1.2.3"}\n');
    assertEquals(await cli("get"), "1.2.3");
    assertEquals(await exists(`${cwd}/VERSION`), false);
    // req:version-sources-004 - inc matches git-latest and runs hooks without persistence.
    const proposed = await cli("git-latest", "patch");
    assertEquals(proposed, "1.2.4");
    const incOutput = await cli("inc", "patch");
    assertStringIncludes(incOutput, "Invoking post_version hook...");
    assertEquals(incOutput.split("\n").at(-1), proposed);
    assertEquals(await exists(`${cwd}/VERSION`), false);
    assertStringIncludes(
      await Deno.readTextFile(`${cwd}/package.json`),
      "1.2.4",
    );

    // req:version-sources-005 - set applies a prerelease to the hook only.
    assertStringIncludes(await cli("set", "1.2.4-rc.1"), "1.2.4-rc.1");
    assertEquals(await exists(`${cwd}/VERSION`), false);
    assertStringIncludes(
      await Deno.readTextFile(`${cwd}/package.json`),
      "1.2.4-rc.1",
    );

    for (
      const [kind, expected] of [
        ["major", "2.0.0"],
        ["minor", "1.3.0"],
        ["none", "1.2.3"],
      ]
    ) {
      await Deno.writeTextFile(`${cwd}/package.json`, '{"version":"1.2.3"}\n');
      const output = await cli("inc", kind);
      assertStringIncludes(output, "Invoking post_version hook...");
      assertEquals(output.split("\n").at(-1), expected);
      assertStringIncludes(
        await Deno.readTextFile(`${cwd}/package.json`),
        expected,
      );
      assertEquals(await exists(`${cwd}/VERSION`), false);
    }
    assertEquals(await git("tag", "--list"), "v1.2.3\nv9.9.9");
    assertEquals(await cli("parse"), "1.2.3");
  } finally {
    await Deno.remove(cwd, { recursive: true });
  }
});

async function exists(path: string) {
  try {
    await Deno.stat(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;
    throw error;
  }
}

Deno.test("req:version-sources-009 - stops at the nearest tag in a shallow clone", async () => {
  const root = await Deno.makeTempDir();
  const source = `${root}/source`;
  const remote = `${root}/origin.git`;
  const shallow = `${root}/shallow`;
  try {
    await Deno.mkdir(source);
    const git = (...args: string[]) => run(source, "git", args);
    await git("init", "-q");
    await git("config", "user.name", "Test");
    await git("config", "user.email", "test@example.com");
    await Deno.writeTextFile(`${source}/README`, "first\n");
    await git("add", "README");
    await git("commit", "-qm", "tagged");
    await git("tag", "-a", "v1.2.3", "-m", "release 1.2.3");
    const oldTree = await git("rev-parse", "v1.2.3^{tree}");
    const oldBlob = await git("rev-parse", "v1.2.3:README");
    await Deno.writeTextFile(`${source}/README`, "second\n");
    await git("add", "README");
    await git("commit", "-qm", "untagged head");
    await git("tag", "v1.1.0");
    await Deno.writeTextFile(`${source}/README`, "third\n");
    await git("add", "README");
    await git("commit", "-qm", "head after nearest tag");
    for (const content of ["fourth", "fifth"]) {
      await Deno.writeTextFile(`${source}/README`, `${content}\n`);
      await git("add", "README");
      await git("commit", "-qm", content);
    }
    const currentBranch = await git("branch", "--show-current");
    await git("switch", "-q", "-c", "unrelated");
    await Deno.writeTextFile(`${source}/README`, "unrelated\n");
    await git("add", "README");
    await git("commit", "-qm", "unrelated branch");
    await git("tag", "v9.9.9");
    await git("switch", "-q", currentBranch);

    await run(root, "git", ["clone", "--bare", source, remote]);
    await run(root, "git", [
      "--git-dir",
      remote,
      "config",
      "uploadpack.allowFilter",
      "true",
    ]);
    await run(root, "git", [
      "clone",
      "--depth",
      "1",
      "--no-tags",
      `file://${remote}`,
      shallow,
    ]);
    const cloneGit = (...args: string[]) => run(shallow, "git", args);
    await cloneGit("checkout", "--detach", "-q");
    assertEquals(
      await cloneGit("rev-parse", "--is-shallow-repository"),
      "true",
    );
    assertEquals(await cloneGit("tag", "--list"), "");
    await Deno.mkdir(`${shallow}/.github`);
    await Deno.writeTextFile(`${shallow}/.github/version.yml`, "source: git\n");

    assertEquals(
      await run(shallow, Deno.execPath(), [
        "run",
        "--cached-only",
        "-A",
        main,
        "get",
      ]),
      "1.1.0",
    );
    assertEquals(
      await cloneGit("rev-parse", "--is-shallow-repository"),
      "true",
    );
    // Resolution fetches tags alongside the deepened history, so unrelated
    // tags come along for the ride; only their tree and blob contents stay
    // excluded by the tree:0 filter.
    assertEquals(
      await cloneGit("tag", "--list"),
      "v1.1.0\nv1.2.3\nv9.9.9",
    );
    for (const object of [oldTree, oldBlob]) {
      const check = await new Deno.Command("git", {
        args: ["cat-file", "-e", object],
        cwd: shallow,
        env: { GIT_NO_LAZY_FETCH: "1" },
        stdout: "null",
        stderr: "null",
      }).output();
      assertEquals(check.code, 1, `${object} should not be fetched`);
    }
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("req:version-sources-002 req:version-sources-003 - nearest tag wins in a complete repository", async () => {
  const cwd = await Deno.makeTempDir();
  const git = (...args: string[]) => run(cwd, "git", args);
  const cli = (...args: string[]) =>
    run(cwd, Deno.execPath(), ["run", "--cached-only", "-A", main, ...args]);
  try {
    await git("init", "-q");
    await git("config", "user.name", "Test");
    await git("config", "user.email", "test@example.com");
    await Deno.writeTextFile(`${cwd}/README`, "old\n");
    await git("add", "README");
    await git("commit", "-qm", "old release");
    await git("tag", "v2.0.0");
    await Deno.writeTextFile(`${cwd}/README`, "new\n");
    await git("add", "README");
    await git("commit", "-qm", "new release");
    await git("tag", "v1.0.0");
    await Deno.writeTextFile(`${cwd}/README`, "head\n");
    await git("add", "README");
    await git("commit", "-qm", "head");

    assertEquals(await cli("get"), "1.0.0");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "1.0.0\n");
    await Deno.mkdir(`${cwd}/.github`);
    await Deno.writeTextFile(`${cwd}/.github/version.yml`, "source: git\n");
    assertEquals(await cli("get"), "1.0.0");
    assertEquals(await exists(`${cwd}/VERSION`), false);
  } finally {
    await Deno.remove(cwd, { recursive: true });
  }
});

Deno.test("req:version-sources-009 - no tags leaves a shallow checkout shallow", async () => {
  const root = await Deno.makeTempDir();
  const source = `${root}/source`;
  const remote = `${root}/origin.git`;
  const shallow = `${root}/shallow`;
  try {
    await Deno.mkdir(source);
    const git = (...args: string[]) => run(source, "git", args);
    await git("init", "-q");
    await git("config", "user.name", "Test");
    await git("config", "user.email", "test@example.com");
    await Deno.writeTextFile(`${source}/README`, "first\n");
    await git("add", "README");
    await git("commit", "-qm", "first");
    const olderCommit = await git("rev-parse", "HEAD");
    await Deno.writeTextFile(`${source}/README`, "second\n");
    await git("add", "README");
    await git("commit", "-qm", "second");
    await run(root, "git", ["clone", "--bare", source, remote]);
    await run(root, "git", [
      "clone",
      "--depth",
      "1",
      "--no-tags",
      `file://${remote}`,
      shallow,
    ]);
    await Deno.mkdir(`${shallow}/.github`);
    await Deno.writeTextFile(`${shallow}/.github/version.yml`, "source: git\n");

    assertEquals(
      await run(shallow, Deno.execPath(), [
        "run",
        "--cached-only",
        "-A",
        main,
        "get",
      ]),
      "0.1.0",
    );
    assertEquals(
      await run(shallow, "git", ["rev-parse", "--is-shallow-repository"]),
      "true",
    );
    const oldCommitCheck = await new Deno.Command("git", {
      args: ["cat-file", "-e", olderCommit],
      cwd: shallow,
      stdout: "null",
      stderr: "null",
    }).output();
    assertEquals(oldCommitCheck.code, 1);
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("req:version-sources-002 - file source initializes without Git", async () => {
  const cwd = await Deno.makeTempDir();
  try {
    const stdout = await run(cwd, Deno.execPath(), [
      "run",
      "--cached-only",
      "-A",
      main,
      "get",
    ]);
    assertEquals(stdout, "0.1.0");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "0.1.0\n");
  } finally {
    await Deno.remove(cwd, { recursive: true });
  }
});

Deno.test("req:version-sources-007 - file increment persists and runs hooks", async () => {
  const cwd = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${cwd}/.github`);
    await Deno.writeTextFile(
      `${cwd}/.github/version.yml`,
      "source: file\non:\n  post:\n    - kind: patch\n      file: package.json\n",
    );
    await Deno.writeTextFile(`${cwd}/VERSION`, "1.2.3\n");
    await Deno.writeTextFile(`${cwd}/package.json`, '{"version":"1.2.3"}\n');
    const stdout = await run(cwd, Deno.execPath(), [
      "run",
      "--cached-only",
      "-A",
      main,
      "inc",
      "patch",
    ]);
    assertStringIncludes(stdout, "1.2.4");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "1.2.4\n");
    assertStringIncludes(
      await Deno.readTextFile(`${cwd}/package.json`),
      "1.2.4",
    );

    // req:version-sources-008 - set persists the requested prerelease and runs hooks.
    const setOutput = await run(cwd, Deno.execPath(), [
      "run",
      "--cached-only",
      "-A",
      main,
      "set",
      "2.0.0-rc.1",
    ]);
    assertStringIncludes(setOutput, "2.0.0-rc.1");
    assertEquals(await Deno.readTextFile(`${cwd}/VERSION`), "2.0.0-rc.1\n");
    assertStringIncludes(
      await Deno.readTextFile(`${cwd}/package.json`),
      "2.0.0-rc.1",
    );
  } finally {
    await Deno.remove(cwd, { recursive: true });
  }
});
