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

export const json = {
  alias: "j",
  type: "flag",
  description: "Output comparison result as JSON",
};

export const prerelease = {
  alias: "p",
  type: "string",
  description: "Include prerelease",
  example: "pr.1",
  default: undefined,
};

export const build = {
  alias: "b",
  type: "string",
  description: "Build metadata",
  example: "1234.abc",
  default: undefined,
};
