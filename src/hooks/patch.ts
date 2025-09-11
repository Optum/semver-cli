import * as path from "path";
import { XMLParser, XMLBuilder } from "xml";
import { modify, applyEdits } from "jsonc-parser";
import { UnsupportedFileKindError } from "../errors/mod.ts";
import { semverFormats } from "../util/variant.ts";
import { exists } from "../util/exists.ts";
import { SemVer } from "semver";

// Define interfaces that were previously in deps/xml.ts
export interface Node extends Record<string, unknown> {
  elements: Element[];
}

export interface Element extends Node {
  type: "element" | "text";
  name: string;
  attributes: Record<string, string>;
  text?: string;
}

// Create xml object using fast-xml-parser
const xmlParser = new XMLParser({ ignoreAttributes: false });
const xmlBuilder = new XMLBuilder({ ignoreAttributes: false });

const xml = { 
  parse: (xmlString: string, options?: any) => xmlParser.parse(xmlString),
  stringify: (obj: any, options?: any) => xmlBuilder.build(obj)
};

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
  const { original } = semverFormats(version);
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
        value.text = original;
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
