# Version sources

This chapter defines how semver-cli derives the current version and how commands
apply a proposed version. The source is selected by the top level `source`
setting in the version configuration.

## Source selection

The supported sources are `file` and `git`. When `source` is absent, the source
is `file`.

## File source

An existing `VERSION` file in the working directory is authoritative. When it is
absent, the CLI initializes it from the nearest parseable local Git tag
reachable from the current ref. If no such tag exists, it initializes the file
to `0.1.0`.

`get` reports a version derived from the current file without changing its
content. `inc` persists the proposed version to the file and applies configured
post hooks. `set` writes the specified version to the file and applies the
configured post hooks.

## Git source

The nearest parseable local Git tag reachable from the current ref is
authoritative. If no such tag exists, the current version is `0.1.0`. Commands
that resolve the current version remove an existing `VERSION` file.

`get` and `parse` without an explicit value derive their result from that
current version. `inc` calculates and reports a proposed version using the same
version calculation as `git-latest` and applies configured post hooks. It does
not write a `VERSION` file or create a tag. `set` applies the specified version
to configured post hooks without creating a `VERSION` file or a tag.

## Tag lookup

The nearest tag is the first parseable version tag encountered while walking
commits from the current ref in Git date order. When several version tags name
that commit, the highest version among them wins. Tags on unrelated branches are
excluded.

In a shallow repository with an `origin` remote, resolution discovers tag refs
without fetching their objects, then deepens only the current checkout's commit
history until it finds that nearest tag. It stops at that point and fetches only
the selected tag. Historical file trees and blobs are excluded from these
fetches. A complete repository, or one without `origin`, uses its existing local
tags. If no parseable tag is reachable, resolution uses `0.1.0`.
