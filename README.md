# About The Project

A technology agnostic cli for common semantic versioning operations.

Built with [Deno](https://deno.land/) 🦕

# Installation

Binaries can be found in the
[Releases](https://github.com/Optum/semver-cli/releases) section. Get the
[latest](https://github.com/Optum/semver-cli/releases/latest) or install from a
supported package manager below.

Installing from binaries or package manager does _not_ require the Deno runtime
to also be installed.

## Homebrew

```sh
brew install optum/tap/semver
```

via [optum](https://github.com/Optum/homebrew-tap)

## From Source

Installation from source will require
[Deno](https://deno.land/manual/getting_started/installation) to be installed.

#### module

```sh
deno install -gfA https://deno.land/x/semver_cli@0.9.13/main.ts -n semver
```

### git

```sh
git clone https://github.com/optum/semver-cli.git
cd semver-cli
deno task install
```

# Usage

```sh
semver <command>

Commands:
  semver get                Get the version
  semver set <value>        Set the version
  semver inc                Increment the version
  semver parse [value]      Parse the version and print
  semver cmp <v1> <v2>      Compare v1 to v2 and return -1/0/1
  semver gt <v1> <v2>       Return 0 if v1 is greater than v2, else 1
  semver gte <v1> <v2>      Return 0 if v1 is greater than or equal to v2, else 1
  semver lt <v1> <v2>       Return 0 if v1 is less than v2, else 1
  semver lte <v1> <v2>      Return 0 if v1 is less than or equal to v2, else 1
  semver eq <v1> <v2>       Return 0 if v1 is equal to v2, else 1
  semver sort [versions..]  Sort semantic versions

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

### About

The `get`, `set` and `inc` commands operate against your working directory. They
all operate against a `VERSION` file found in the root folder of your project.

If the `VERSION` file is not found the default version is `0.1.0`. The `inc`
command will create the `VERSION` file if it doesn't already exist.

The `parse` command accepts a version string as input and parses and prints that
version as output if it is valid.

The `sort` command accepts one or more version strings and outputs them in
sorted order (descending by default, one version per line). Use the `-a` flag
for ascending order, or read versions from stdin using `--`.

#### examples

```sh
# No VERSION file
semver get # 0.1.0
```

```sh
# Sets the VERSION file to 1.2.3 specifically
semver set 1.2.3  # 1.2.3
```

```sh
# Gets the version and increments it, but does not update the VERSION file
semver get minor # 1.3.0
semver get # 1.2.3
```

```sh
# parses a version string
semver parse 1.0.0 # {"major":1,"minor":1,"patch":0,"prerelease":[],"build":[]}
```

```sh
# sort versions in descending order (default)
semver sort 2.0.0 1.0.0 3.0.0
# 3.0.0
# 2.0.0
# 1.0.0
```

```sh
# sort versions in ascending order
semver sort -a 2.0.0 1.0.0 3.0.0
# 1.0.0
# 2.0.0
# 3.0.0
```

```sh
# sort versions from stdin
cat versions.txt | semver sort --
# (sorted output)
```

### Incrementing

When calling the command `inc` the `VERSION` file will be updated based on the
sub command specified, `major`, `minor`, `patch`, `none`. Additional metadata
may be added to the version using the `--prerelease` and `--build` parameters.

When incrementing with a prerelease label such as `--prerelease beta` then a
prerelease number will be added or incremented automatically such as `beta.0`.
If the version is incremented again with `--prerelease beta` then it will
increment the number to `beta.1`. Switching the prerelease label which reset the
number. `--prerelease alpha` will reset the number back to `alpha.0`.

`none` can be used to synchronize new or out of sync files with post hooks, and
also it can be used in conjunction with `--prerelease` and `--build` without
incrementing the main version numbers.

#### examples

```sh
semver set 1.2.3
semver inc none  # 1.2.3
semver inc patch # 1.2.4
semver inc minor # 1.3.0
semver inc major # 2.0.0
```

```sh
semver set 1.2.3-pre.0
semver inc --prerelease alpha # 1.2.3-alpha.0
semver inc --prerelease alpha # 1.2.3-alpha.1
semver inc --build 1          # 1.2.3-alpha.1+1
semver inc --prerelease beta  # 1.2.3-beta.0+1
```

### Increment Post Hooks

In addition to updating the `VERSION` file, semver can optionally update source
code files in your project. To configure the version command you can provide a
configuration file at `.github/version.yml`.

There are a number of supported post hook kinds and a number of supported known
project kinds which make updating source code files easy.

#### post hook kind

| kind      | description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `replace` | replaced the previous version string with the next version string in a file |
| `patch`   | supports auto-updating a set of well known file types (e.g. package.json)   |
| `regexp`  | replaces matching string using a regexp                                     |

#### patch file kinds

| file kind      | description                                                                    |
| -------------- | ------------------------------------------------------------------------------ |
| `.csproj`      | Updates the `<PropertyGroup><Version>0.1.0</Version></PropertyGroup>` element  |
| `package.json` | Updates the `"version": "0.1.0"` of the `package.json` and `package-lock.json` |
| `Chart.yaml`   | Updates the `version: 0.1.0` of the chart file                                 |
| `pom.xml`      | Updates the `<project><version>0.1.0</version></project>` element              |

> If you would like another well known file type supported please file an issue
> or contribute a pull request. The `replace` or `regexp` post hook kinds are
> flexible in the meantime.

#### example

```yml
on:
  post:
    # Updates both package.json and package-lock.json
    - kind: patch
      file: package.json

    # Uses non-matching groups to isolate the version to replace.
    - kind: regexp
      file: src/info.js
      pattern: '^(?<=export const version = ").*(?=";)$'
```

## Actions

This repository has two actions available, either a basic setup action or a
single docker based action.

#### example

```yml
name: Publish
on:
  workflow_dispatch:
    inputs:
      pre:
        type: boolean
        default: true
  release:
    types: [published]

jobs:
  publish:
    steps:
      - if: ${{ inputs.pre || github.event.release.prerelease }}
        name: Increment Pre-Release Version
        uses: optum/semver-cli@1.0.8
        with:
          action: inc
          prerelease: pre${{ github.run_number }}
          build: ${{ github.run_id }}

      - id: version
        name: Get Version
        uses: optum/semver-cli@1.0.8

      - run: echo "The calculated ${{ steps.version.outputs.version }}"
```

#### example of setup action

```yml
name: Publish
on:
  release:
    types: [published]

jobs:
  publish:
    steps:
      - name: Increment Pre-Release Version
        uses: optum/semver-cli/setup@0.9.20

      - id: version
        name: Parse Version
        run: |
          VERSION=$(semver get)
          echo "version=$(echo $VERSION | jq -r '.version')" > $GITHUB_OUTPUT
          echo "major=$(echo $VERSION | jq -r '.major')" > $GITHUB_OUTPUT
          echo "minor=$(echo $VERSION | jq -r '.minor')" > $GITHUB_OUTPUT
          echo "patch=$(echo $VERSION | jq -r '.patch')" > $GITHUB_OUTPUT

      - run: echo "The calculated ${{ steps.version.outputs.version }}"
```

# Contributing

Contributions are what make the open source community such an amazing place to
learn, inspire, and create. Any contributions you make are **greatly
appreciated**.

If you have a suggestion that would make this better, please fork the repo and
create a pull request. You can also simply open an issue with the tag
"enhancement". Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the Apache 2.0 License. See [`LICENSE`](./LICENSE) for more
information.

## Maintainers

- Justin Chase
  - GitHub Enterprise: [justinmchase](https://github.com/justinmchase)
  - Email: justin.chase@optum.com
