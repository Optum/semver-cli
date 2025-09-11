import * as path from "path";
import { parseString as parseXml } from "xml2js";
import { js2xml } from "js2xml";
import * as JSONC from "jsonc";
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

// Create helper functions for XML parsing
function parseXmlPromise(xmlString: string, options?: any): Promise<Node> {
  return new Promise((resolve, reject) => {
    parseXml(xmlString, options, (err, result) => {
      if (err) reject(err);
      else {
        // Convert xml2js result to our expected format
        const elements = result ? Object.keys(result).map(key => ({
          type: "element" as const,
          name: key,
          attributes: {},
          elements: []
        })) : [];
        resolve({ elements });
      }
    });
  });
}

const xml = { 
  parse: parseXmlPromise,
  stringify: js2xml 
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
  const edits = JSONC.modify(contents, ["version"], original, {});
  const result = JSONC.applyEdits(contents, edits);
  await Deno.writeTextFile(file, result);
}

async function patchPackageLockJson(packageJsonPath: string, version: SemVer) {
  const { original } = semverFormats(version);
  const dir = path.dirname(packageJsonPath);
  const packageLockJsonPath = path.resolve(dir, "package-lock.json");
  if (await exists(packageLockJsonPath)) {
    const contents = await Deno.readTextFile(packageLockJsonPath);
    const versionEdits = JSONC.modify(contents, ["version"], original, {});
    const moduleVersionEdits = JSONC.modify(
      contents,
      ["packages", "", "version"],
      original,
      {},
    );
    const edits = [...versionEdits, ...moduleVersionEdits];
    const result = JSONC.applyEdits(contents, edits);
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
