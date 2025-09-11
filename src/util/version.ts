import { path } from "../../deps/std.ts";
import { format, parse, SemVer } from "../../deps/semver.ts";
import { IContext } from "../context.ts";
import { semverFormats } from "./variant.ts";

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
) {
  const formatted = format(semver);
  const { major, minor, patch, prerelease, build } = semver;
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

    // Adding these for backwards compatibility, do not remove or add more
    // todo: remove on next major version
    version_default: formatted,
    version_dotnet: dotnet,
    version_docker: docker,
  });
  if (forceJson) {
    console.log(JSON.stringify({
      version: formatted,
      major,
      minor,
      patch,
      prerelease: pre,
      build: b,
      dotnet,
      docker,
    }));
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
    console.log(JSON.stringify({
      v1,
      v2,
      result,
      command,
    }));
  } else {
    // Human-readable output to stdout using the result parameter
    if (command === "eq") {
      if (result === 0) {
        console.log(`${v1} and ${v2} are equal`);
      } else {
        console.log(`${v1} and ${v2} are not equal`);
      }
    } else if (command === "cmp") {
      if (result === -1) {
        console.log(`${v1} is less than ${v2}`);
      } else if (result === 0) {
        console.log(`${v1} is equal to ${v2}`);
      } else {
        console.log(`${v1} is greater than ${v2}`);
      }
    } else {
      // For gt, gte, lt, lte commands, use the result parameter (comparison result)
      if (result > 0) {
        console.log(`${v1} is greater than ${v2}`);
      } else if (result === 0) {
        console.log(`${v1} is equal to ${v2}`);
      } else {
        console.log(`${v1} is less than ${v2}`);
      }
    }
  }
}

/**
 * This reads the current version file found at $CWD/VERSION and parses it as a
 * valid SemVer. If the file is not found, is empty, or contains an invalid
 * version then the default version `0.0.0` is returned.
 * @returns The parsed version or default version
 */
export async function readVersionFile() {
  try {
    const versionText = await Deno.readTextFile("VERSION");
    const trimmed = versionText.trim();
    return parse(trimmed || DEFAULT_VERSION) || DEFAULT_VERSION;
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
