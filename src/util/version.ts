import { path } from "../../deps/std.ts";
import { format, parse, SemVer } from "../../deps/semver.ts";
import { IContext } from "../context.ts";

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
) {
  const formatted = format(semver);
  const { major, minor, patch, prerelease, build } = semver;
  const other = variants(formatted);
  const pre = prerelease.join(".");
  const b = build.join(".");
  await writeGithubOutput(context, {
    version: formatted,
    major,
    minor,
    patch,
    prerelease: pre,
    build: b,
    ...other,
  });
  if (full) {
    console.log(JSON.stringify({
      version: formatted,
      major,
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

export function variants(version: string) {
  const kabobBuild = version.replace(/[+]/g, "-");
  // todo: add any other platform specific variants here.
  return {
    version_dotnet: kabobBuild,
    version_docker: kabobBuild,
  };
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
