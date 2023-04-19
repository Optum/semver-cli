import { parse, SemVer } from "../../deps/semver.ts";
import { IContext } from "../context.ts";

export const DEFAULT_VERSION = new SemVer("0.1.0");

async function writeGithubOutput(
  context: IContext,
  values: Record<string, string | number>,
) {
  if (context.githubOutput) {
    for (const [name, value] of Object.entries(values)) {
      await Deno.writeTextFile(context.githubOutput, `${name}=${value}\n`, {
        append: true,
      });
    }
  }
}

export async function printVersion(
  context: IContext,
  semver: SemVer,
  full = false,
) {
  const formatted = semver.format({ style: "full" });
  const { major, minor, patch, prerelease, build } = semver;
  const pre = prerelease.join(".");
  const b = build.join(".");
  await writeGithubOutput(context, {
    version: formatted,
    major,
    minor,
    patch,
    prerelease: pre,
    build: b,
  });
  if (full) {
    console.log(JSON.stringify({
      major,
      minor,
      patch,
      prerelease: pre,
      build: b,
    }));
  } else {
    console.log(formatted);
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
    if (err.code === "ENOENT") {
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
  await Deno.writeTextFile("VERSION", `${version.format({ style: "full" })}\n`);
}
