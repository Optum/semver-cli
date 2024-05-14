import { path } from "../../deps/std.ts";
import { Node, xml } from "../../deps/xml.ts";
import { JSONC } from "../../deps/jsonc.ts";
import { UnsupportedFileKindError } from "../errors/mod.ts";
import { semverFormats } from "../util/variant.ts";
import { exists } from "../util/exists.ts";
import { SemVer } from "../../deps/semver.ts";

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
  const document = xml.parse(contents, {
    captureSpacesBetweenElements: true,
  }) as Node;
  const project = document.elements[0];
  if (project.type !== "element" || project.name !== "Project") {
    throw new UnsupportedFileKindError(file, {
      cause: new Error("The csproj file must contain a root Project element"),
    });
  }

  let isVersionSet = false;
  for (const el of project.elements) {
    if (isVersionSet) {
      break;
    } else if (el.type === "element" && el.name === "PropertyGroup") {
      for (const property of el.elements) {
        if (property.type === "element" && property.name === "Version") {
          const value = property.elements[0];
          if (value.type === "text") {
            value.text = dotnet;
            isVersionSet = true;
            break;
          }
        }
      }
    }
  }

  if (!isVersionSet) {
    throw new UnsupportedFileKindError(file, {
      cause: new Error(
        "The csproj file must contain a '<PropertyGroup><Version>0.0.0</Version></PropertyGroup>' element",
      ),
    });
  }

  const updated = xml.stringify(document, {
    compact: false,
  });
  await Deno.writeTextFile(file, updated);
}

async function patchPomXml(file: string, version: SemVer) {
  const { def } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const document = xml.parse(contents, {
    captureSpacesBetweenElements: true,
  }) as Node;
  const project = document.elements[0];
  if (project.type !== "element" || project.name !== "project") {
    throw new UnsupportedFileKindError(file, {
      cause: new Error(
        "The pom.xml file must contain a root <project> element",
      ),
    });
  }

  let isVersionSet = false;
  for (const el of project.elements) {
    if (isVersionSet) {
      break;
    } else if (el.type === "element" && el.name === "version") {
      const value = el.elements[0];
      if (value.type === "text") {
        value.text = def;
        isVersionSet = true;
        break;
      }
    }
  }

  if (!isVersionSet) {
    throw new UnsupportedFileKindError(file, {
      cause: new Error(
        "The pom.xml file must contain a '<project><version>0.0.0</version></project>' element",
      ),
    });
  }

  const updated = xml.stringify(document, {
    compact: false,
  });
  await Deno.writeTextFile(file, updated);
}

async function patchPackageJson(file: string, version: SemVer) {
  const { def } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const edits = JSONC.modify(contents, ["version"], def, {});
  const result = JSONC.applyEdits(contents, edits);
  await Deno.writeTextFile(file, result);
}

async function patchPackageLockJson(packageJsonPath: string, version: SemVer) {
  const { def } = semverFormats(version);
  const dir = path.dirname(packageJsonPath);
  const packageLockJsonPath = path.resolve(dir, "package-lock.json");
  if (await exists(packageLockJsonPath)) {
    const contents = await Deno.readTextFile(packageLockJsonPath);
    const versionEdits = JSONC.modify(contents, ["version"], def, {});
    const moduleVersionEdits = JSONC.modify(
      contents,
      ["packages", "", "version"],
      def,
      {},
    );
    const edits = [...versionEdits, ...moduleVersionEdits];
    const result = JSONC.applyEdits(contents, edits);
    await Deno.writeTextFile(packageLockJsonPath, result);
  }
}

async function patchChartYaml(file: string, version: SemVer) {
  const { def } = semverFormats(version);
  const contents = await Deno.readTextFile(file);
  const result = contents.replace(
    /^version:\s*(.*)$/m,
    `version: ${def}`,
  );
  await Deno.writeTextFile(file, result);
}
