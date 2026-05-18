import * as path from "path";
import { applyEdits, modify } from "jsonc-parser";
import { UnsupportedFileKindError } from "../errors/mod.ts";
import { FormatKind, semverFormats } from "../util/variant.ts";
import { exists } from "../util/exists.ts";
import { SemVer } from "semver";

export async function patch(
  file: string,
  version: SemVer,
  format?: FormatKind,
) {
  const ext = path.extname(file);
  const fileName = path.basename(file);
  if (ext === ".csproj" || ext === ".targets") {
    await patchCsproj(file, version, format);
  } else if (fileName === "package.json") {
    await patchPackageJson(file, version, format);
    await patchPackageLockJson(file, version, format);
  } else if (fileName === "Chart.yaml") {
    await patchChartYaml(file, version, format);
  } else if (fileName === "pom.xml") {
    await patchPomXml(file, version, format);
  } else {
    throw new UnsupportedFileKindError(file);
  }
}

async function patchCsproj(file: string, version: SemVer, format?: FormatKind) {
  const formats = semverFormats(version);
  const newVersion = formats[format ?? FormatKind.Dotnet];
  console.log(`patching ${newVersion} in ${file}`);

  const contents = await Deno.readTextFile(file);
  const r =
    /(?<=<Project.*>(.|\n)*<PropertyGroup>(.|\n)*<Version>).*(?=<\/Version>)/;
  const updated = contents.replace(r, newVersion);
  await Deno.writeTextFile(file, updated);
}

async function patchPomXml(file: string, version: SemVer, format?: FormatKind) {
  const formats = semverFormats(version);
  const newVersion = formats[format ?? FormatKind.Original];
  console.log(`patching ${newVersion} in ${file}`);

  const contents = await Deno.readTextFile(file);
  const r = /(?<=<project>(.|\n)*<version>).*(?=<\/version>)/;
  const updated = contents.replace(r, newVersion);
  await Deno.writeTextFile(file, updated);
}

async function patchPackageJson(
  file: string,
  version: SemVer,
  format?: FormatKind,
) {
  const formats = semverFormats(version);
  const newVersion = formats[format ?? FormatKind.Original];
  console.log(`patching ${newVersion} in ${file}`);

  const contents = await Deno.readTextFile(file);
  const edits = modify(contents, ["version"], newVersion, {});
  const result = applyEdits(contents, edits);
  await Deno.writeTextFile(file, result);
}

async function patchPackageLockJson(
  packageJsonPath: string,
  version: SemVer,
  format?: FormatKind,
) {
  const formats = semverFormats(version);
  const newVersion = formats[format ?? FormatKind.Original];
  const dir = path.dirname(packageJsonPath);
  const packageLockJsonPath = path.resolve(dir, "package-lock.json");
  if (await exists(packageLockJsonPath)) {
    const contents = await Deno.readTextFile(packageLockJsonPath);
    const versionEdits = modify(contents, ["version"], newVersion, {});
    const moduleVersionEdits = modify(
      contents,
      ["packages", "", "version"],
      newVersion,
      {},
    );
    const edits = [...versionEdits, ...moduleVersionEdits];
    const result = applyEdits(contents, edits);
    await Deno.writeTextFile(packageLockJsonPath, result);
  }
}

async function patchChartYaml(
  file: string,
  version: SemVer,
  format?: FormatKind,
) {
  const formats = semverFormats(version);
  const newVersion = formats[format ?? FormatKind.Original];
  console.log(`patching ${newVersion} in ${file}`);

  const contents = await Deno.readTextFile(file);
  const result = contents.replace(
    /^version:\s*(.*)$/m,
    `version: ${newVersion}`,
  );
  await Deno.writeTextFile(file, result);
}
