import * as path from "path";
import { compare, format, parse, SemVer, tryParse } from "semver";
import { IContext } from "../context.ts";
import { HookWarning } from "../hooks/hooks.interfaces.ts";
import { semverFormats } from "./variant.ts";
import { ConventionalGitClient } from "@conventional-changelog/git-client";
import { getVersionSource } from "./config.ts";

export const DEFAULT_VERSION = parse("0.1.0");

async function writeGithubOutput(
  context: IContext,
  values: Record<string, string | number>,
) {
  if (context.output) {
    const dir = path.dirname(context.output);
    await Deno.mkdir(dir, { recursive: true });
    for (const [name, value] of Object.entries(values)) {
      await Deno.writeTextFile(context.output, `${name}=${value}\n`, {
        create: true,
        append: true,
      });
    }
  }
}

export async function printVersion(
  context: IContext,
  semver: SemVer,
  forceJson = false,
  hookWarnings: HookWarning[] = [],
) {
  const formatted = format(semver);
  const { major, minor, patch, prerelease = [], build = [] } = semver;
  const pre = prerelease.join(".");
  const b = build.join(".");
  const { dotnet, docker } = semverFormats(semver);
  await writeGithubOutput(context, {
    version: formatted,
    major,
    minor,
    patch,
    prerelease: pre,
    build: b,
    dotnet,
    docker,
    ...(hookWarnings.length > 0
      ? { hook_warnings: JSON.stringify(hookWarnings) }
      : {}),

    // Adding these for backwards compatibility, do not remove or add more
    // todo: remove on next major version
    version_default: formatted,
    version_dotnet: dotnet,
    version_docker: docker,
  });
  if (forceJson) {
    console.log(
      JSON.stringify({
        version: formatted,
        major,
        minor,
        patch,
        prerelease: pre,
        build: b,
        dotnet,
        docker,
      }),
    );
  } else {
    console.log(formatted);
  }
}

export async function printComparison(
  context: IContext,
  v1: string,
  v2: string,
  result: number,
  command: string,
  forceJson = false,
) {
  // Write to GitHub output if running in GitHub Actions
  await writeGithubOutput(context, {
    v1,
    v2,
    result,
    command,
  });

  if (forceJson) {
    // JSON output - emit structured data
    console.log(
      JSON.stringify({
        v1,
        v2,
        result,
        command,
      }),
    );
  } else {
    // Human-readable output to stdout using the result parameter
    if (command === "eq") {
      if (result === 0) {
        console.log(`${v1} is equal to ${v2}`);
      } else {
        console.log(`${v1} is not equal to ${v2}`);
      }
    } else if (command === "cmp") {
      if (result === -1) {
        console.log(`${v1} is less than ${v2}`);
      } else if (result === 0) {
        console.log(`${v1} is equal to ${v2}`);
      } else {
        console.log(`${v1} is greater than ${v2}`);
      }
    } else if (command == "gt") {
      if (result === 0) {
        console.log(`${v1} is greater than ${v2}`);
      } else {
        console.log(`${v1} is not greater than ${v2}`);
      }
    } else if (command == "gte") {
      if (result === 0) {
        console.log(`${v1} is greater than or equal to ${v2}`);
      } else {
        console.log(`${v1} is not greater than or equal to ${v2}`);
      }
    } else if (command == "lt") {
      if (result === 0) {
        console.log(`${v1} is less than ${v2}`);
      } else {
        console.log(`${v1} is not less than ${v2}`);
      }
    } else if (command == "lte") {
      if (result === 0) {
        console.log(`${v1} is less than or equal to ${v2}`);
      } else {
        console.log(`${v1} is not less than or equal to ${v2}`);
      }
    } else {
      throw new Error(`Unknown command for printComparison: ${command}`);
    }
  }
}

/**
 * This reads the current version file found at $CWD/VERSION and parses it as a
 * valid SemVer. If the file is not found or is empty, the default version
 * `0.1.0` is returned. Invalid versions raise a parse error.
 * @returns The parsed version or default version
 */
export async function readVersionFile(): Promise<SemVer> {
  try {
    const versionText = await Deno.readTextFile("VERSION");
    const trimmed = versionText.trim();
    return trimmed ? parse(trimmed) : DEFAULT_VERSION;
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return DEFAULT_VERSION;
    } else {
      throw err;
    }
  }
}

/**
 * Write the full version to the version file found at $CWD/VERSION
 * @param version The version to write
 */
export async function writeVersionFile(version: SemVer) {
  await Deno.writeTextFile("VERSION", `${format(version)}\n`);
}

/**
 * Creates a local git client
 */
export const gitClientFactory = {
  create() {
    return new ConventionalGitClient(Deno.cwd());
  },
};

/**
 * Attempts to determine the latest version as specified by git tags
 */
export async function getVersionFromGitTags() {
  const client = gitClientFactory.create();
  const tags = new Map<
    string,
    { ref: string; version: SemVer; remote: boolean }[]
  >();
  const localRefs = new Set<string>();
  function addTag(commit: string, ref: string, remote: boolean) {
    const version = tryParse(ref.slice("refs/tags/".length));
    if (!version || !commit) return;
    const entries = tags.get(commit) ?? [];
    entries.push({ ref, version, remote });
    tags.set(commit, entries);
  }

  const localTags = await client.exec(
    "for-each-ref",
    "--format=%(refname)%09%(objectname)%09%(*objectname)",
    "refs/tags",
  );
  for (const line of localTags.split("\n")) {
    const [ref, object, peeled] = line.split("\t");
    if (!ref?.startsWith("refs/tags/")) continue;
    localRefs.add(ref);
    addTag(peeled || object, ref, false);
  }

  let isShallow =
    (await client.exec("rev-parse", "--is-shallow-repository")) === "true";
  const hasOrigin = isShallow &&
    (await client.exec("remote")).split(/\s+/).includes("origin");
  if (hasOrigin) {
    const remoteTags = await client.exec("ls-remote", "--tags", "origin");
    const remoteRefs = new Map<string, { object?: string; commit?: string }>();
    for (const line of remoteTags.split("\n")) {
      const [object, ref] = line.split("\t");
      if (!object || !ref?.startsWith("refs/tags/")) continue;
      const peeled = ref.endsWith("^{}");
      const name = peeled ? ref.slice(0, -3) : ref;
      const tag = remoteRefs.get(name) ?? {};
      if (peeled) tag.commit = object;
      else tag.object = object;
      remoteRefs.set(name, tag);
    }
    for (const [ref, tag] of remoteRefs) {
      if (!localRefs.has(ref)) {
        addTag(tag.commit ?? tag.object ?? "", ref, true);
      }
    }
  }

  async function nearestTag() {
    const history = await client.exec("rev-list", "--date-order", "HEAD");
    for (const commit of history.split("\n")) {
      const candidates = tags.get(commit);
      if (candidates?.length) {
        return candidates.reduce((best, tag) =>
          compare(tag.version, best.version) > 0 ? tag : best
        );
      }
    }
  }

  let nearest = await nearestTag();
  if (hasOrigin) {
    const head = await client.exec("rev-parse", "HEAD");
    let deepen = 1;
    while (!nearest && isShallow && tags.size > 0) {
      const before = await client.exec("rev-list", "--count", "HEAD");
      await client.exec(
        "fetch",
        "--filter=tree:0",
        "--no-tags",
        `--deepen=${deepen}`,
        "origin",
        head,
      );
      nearest = await nearestTag();
      isShallow =
        (await client.exec("rev-parse", "--is-shallow-repository")) === "true";
      if (
        isShallow &&
        (await client.exec("rev-list", "--count", "HEAD")) === before
      ) {
        throw new Error("Unable to deepen the current Git history from origin");
      }
      deepen *= 2;
    }
    if (nearest?.remote) {
      await client.exec(
        "fetch",
        "--filter=tree:0",
        "--no-tags",
        "origin",
        `${nearest.ref}:${nearest.ref}`,
      );
    }
  }
  return nearest?.version ?? DEFAULT_VERSION;
}

export async function readCurrentVersion(context: IContext): Promise<SemVer> {
  let contents: string | undefined;
  try {
    contents = await Deno.readTextFile("VERSION");
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
  if (await getVersionSource(context) === "git") {
    await removeVersionFile();
    return await getVersionFromGitTags();
  }
  if (contents === undefined) {
    let version: SemVer;
    try {
      version = await getVersionFromGitTags();
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.includes("not a git repository")
      ) {
        throw error;
      }
      version = DEFAULT_VERSION;
    }
    await writeVersionFile(version);
    return version;
  }
  return contents.trim() ? parse(contents.trim()) : DEFAULT_VERSION;
}

export async function removeVersionFile() {
  try {
    await Deno.remove("VERSION");
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  }
}

export async function writeCurrentVersion(context: IContext, version: SemVer) {
  if (await getVersionSource(context) === "file") {
    await writeVersionFile(version);
  } else {
    await removeVersionFile();
  }
}
