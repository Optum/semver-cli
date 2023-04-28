export const config = {
  alias: "c",
  type: "string",
  description: "Path to config file",
  example: "version.yml",
  default: undefined,
};
export const output = {
  alias: "o",
  type: "string",
  description: "Outputs version as key value pairs to output file",
  example: "$GITHUB_OUTPUT",
  default: undefined,
};

export const build = {
  alias: "b",
  type: "string",
  description: "Build metadata",
  example: "1234.abc",
  default: undefined,
};

export const prerelease = {
  alias: "p",
  type: "flag",
  description: "Include prerelease",
};

export const prereleaseName = {
  alias: "n",
  type: "string",
  description: "Prerelease name",
  example: "alpha",
  default: "pre",
};

export const prereleaseValue = {
  alias: "v",
  type: "number",
  description: "Prerelease number value",
  default: undefined,
};
