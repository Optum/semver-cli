import * as path from "path";
import { applyEdits, modify } from "jsonc-parser";
import { UnsupportedFileKindError } from "../errors/mod.ts";
import { semverFormats } from "../util/variant.ts";
import { exists } from "../util/exists.ts";
import { SemVer } from "semver";

export async function patch(
  file: string,
  version: SemVer,
) {
  console.log(`patching ${version} in ${file}`);
  const ext = path.extname(file);
  const fileName = path.basename(file);
  if (ext === ".csproj" || ext === ".targets") {
    await patchCsproj(file, version);
  } else if (fileName === "package.json") {
    await patchPackageJson(file, version);
    await patchPackageLockJson(file, version);
  } else if (fileName === "Chart.yaml") {
    await patchChartYaml(file, version);
  } else if (fileName === "pom.xml") {
    await patchPomXml(file, version);
  } else {
    throw new UnsupportedFileKindError(file);
  }
}

async function patchCsproj(file: string, version: SemVer) {
  const { dotnet } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const r = /(?<=<Project.*>(.|\n)*<PropertyGroup>(.|\n)*<Version>).*(?=<\/Version>)/;
  const updated = contents.replace(r, dotnet);
  await Deno.writeTextFile(file, updated);
}

async function patchPomXml(file: string, version: SemVer) {
  const { original } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const r = /(?<=<project>(.|\n)*<version>).*(?=<\/version>)/;
  const updated = contents.replace(r, original);
  await Deno.writeTextFile(file, updated);
}

async function patchPackageJson(file: string, version: SemVer) {
  const { original } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const edits = modify(contents, ["version"], original, {});
  const result = applyEdits(contents, edits);
  await Deno.writeTextFile(file, result);
}

async function patchPackageLockJson(packageJsonPath: string, version: SemVer) {
  const { original } = semverFormats(version);
  const dir = path.dirname(packageJsonPath);
  const packageLockJsonPath = path.resolve(dir, "package-lock.json");
  if (await exists(packageLockJsonPath)) {
    const contents = await Deno.readTextFile(packageLockJsonPath);
    const versionEdits = modify(contents, ["version"], original, {});
    const moduleVersionEdits = modify(
      contents,
      ["packages", "", "version"],
      original,
      {},
    );
    const edits = [...versionEdits, ...moduleVersionEdits];
    const result = applyEdits(contents, edits);
    await Deno.writeTextFile(packageLockJsonPath, result);
  }
}

async function patchChartYaml(file: string, version: SemVer) {
  const { original } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const result = contents.replace(
    /^version:\s*(.*)$/m,
    `version: ${original}`,
  );
  await Deno.writeTextFile(file, result);
}
