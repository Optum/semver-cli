import * as YAML from "yaml";
import { IContext } from "../context.ts";
import { VersionConfig } from "../hooks/hooks.interfaces.ts";
import { exists } from "./exists.ts";

const configCache = new WeakMap<IContext, Promise<VersionConfig | undefined>>();

export function getVersionConfig(
  context: IContext,
): Promise<VersionConfig | undefined> {
  let result = configCache.get(context);
  if (!result) {
    result = readVersionConfig(context);
    configCache.set(context, result);
  }
  return result;
}

async function readVersionConfig(
  context: IContext,
): Promise<VersionConfig | undefined> {
  const configPath = context.config ?? context.c;
  const paths = configPath ? [configPath] : [
    [context.githubDir, "version.yml"].filter(Boolean).join("/"),
    [context.githubDir, "version.yaml"].filter(Boolean).join("/"),
  ];
  for (const path of paths) {
    if (await exists(path)) {
      return YAML.parse(await Deno.readTextFile(path)) as VersionConfig;
    }
  }
}

export async function getVersionSource(
  context: IContext,
): Promise<"file" | "git"> {
  if (!context.config && !context.c && !context.githubDir) return "file";
  const source = (await getVersionConfig(context))?.source ?? "file";
  if (source !== "file" && source !== "git") {
    throw new TypeError(
      `Invalid version source: ${source}. Expected file or git.`,
    );
  }
  return source;
}
