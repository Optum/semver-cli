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
  full = false,
  prefix = "",
) {
  const formatted = format(semver);
  const sv_major = semver.major;
  const { minor, patch, prerelease, build } = semver;
  const pre = prerelease.join(".");
  const b = build.join(".");
  const other = semverFormats(semver, prefix);
  await writeGithubOutput(context, {
    version: formatted,
    sv_major,
    minor,
    patch,
    prerelease: pre,
    build: b,
    ...other,
  });
  if (full) {
    console.log(JSON.stringify({
      version: formatted,
      sv_major,
      minor,
      patch,
      prerelease: pre,
      build: b,
      ...other,
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
  await Deno.writeTextFile("VERSION", `${format(version)}\n`);
}
