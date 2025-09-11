# Semver CLI

A Deno-based command line tool for semantic versioning operations supporting
multiple project types (Node.js, Helm Charts, Maven, .NET).

**ALWAYS follow these instructions first and only fallback to search or
additional context gathering if the information here is incomplete or found to
be in error.**

## Working Effectively

### Bootstrap and Setup

1. **Install Deno runtime**: Download and install Deno v2.x
   ```bash
   wget -O deno.zip https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip
   unzip deno.zip
   chmod +x deno
   sudo mv deno /usr/local/bin/
   ```

2. **Verify installation**:
   ```bash
   deno --version  # Should show v2.x
   ```

### Building and Testing

1. **NEVER CANCEL builds or tests** - they complete quickly (under 2 minutes)
2. **Format check**: `deno fmt --check` - Takes ~5 seconds, NEVER CANCEL
3. **Lint check**: `deno lint` - Takes ~10 seconds, NEVER CANCEL
   - **KNOWN ISSUE**: 8 linting errors about import prefixes - these are
     expected and do not break functionality
   - Lint failures do not prevent the tool from working correctly
4. **Run all tests**:
   ```bash
   deno task test
   ```
   - Takes ~1 second for 32 tests, NEVER CANCEL
   - Set timeout to 60+ seconds minimum for safety

### Running the CLI Tool

**Basic usage**:

```bash
deno run -A main.ts --help
deno run -A main.ts get
deno run -A main.ts parse
```

### Installation (Optional)

```bash
# Global install (requires --global flag)
deno install --global --allow-run --allow-env --allow-read --allow-write -f main.ts -n semver
```

**Note**: Installation task in deno.json is missing the `--global` flag and will
fail.

## Validation

### Required Validation Steps

**ALWAYS run these validation steps after making any changes:**

1. **Format and basic checks**:
   ```bash
   deno fmt --check  # ~5 seconds
   deno lint         # ~10 seconds (expect 8 import prefix errors - this is normal)
   ```

2. **Full test suite** (NEVER CANCEL - completes in ~1 second):
   ```bash
   deno task test
   ```

3. **Manual CLI validation** - Test core functionality:
   ```bash
   cd /tmp && mkdir semver-validation && cd semver-validation
   echo "1.0.0" > VERSION

   # Test basic commands
   deno run -A /path/to/semver-cli/main.ts get      # Should output: 1.0.0
   deno run -A /path/to/semver-cli/main.ts inc patch  # Should output: 1.0.1
   deno run -A /path/to/semver-cli/main.ts get      # Should output: 1.0.1
   cat VERSION  # Should contain: 1.0.1
   ```

4. **Project integration validation** - Test post-hooks work (READ-ONLY):
   ```bash
   # Test Node.js integration (read-only - safe to run)
   cd test/node && deno run -A ../../main.ts get

   # Test other project types (read-only - safe to run)
   cd ../helm && deno run -A ../../main.ts get
   cd ../maven && deno run -A ../../main.ts get  
   cd ../dotnet && deno run -A ../../main.ts get
   ```

   **IMPORTANT**: Only use `get` commands in test directories. Never run `inc`,
   `set`, or other modifying commands in the `test/` folders as these are manual
   test scenarios and their changes should not be committed.

### Known Limitations

- **Compilation fails**: `deno compile` fails due to network restrictions - this
  is expected
- **Lint errors**: 8 import prefix lint errors are expected and don't affect
  functionality
- **Global install**: The install task is missing `--global` flag - add it if
  needed

### Test Directory Guidelines

**CRITICAL**: Files in the `test/` directory are manual test scenarios and
should NOT have their version changes committed:

- **Safe commands in test directories**: `get`, `parse` - these are read-only
- **NEVER run in test directories**: `inc`, `set` - these modify files and
  create unwanted commits
- **If you accidentally modify test files**: Use `git checkout HEAD -- test/` to
  revert all test directory changes before committing
- **When adding test coverage**: It's fine to modify test files to expand
  coverage, but revert any version changes made by running semver commands

## Common Tasks

### Repository Structure

```
/home/runner/work/semver-cli/semver-cli/
├── .github/             # GitHub workflows and configuration
├── deps/                # Deno dependencies (causes lint warnings)
├── src/                 # Main source code
├── test/                # Test directories for different project types
├── main.ts              # CLI entry point
├── deno.json            # Deno configuration and tasks
├── VERSION              # Current project version
└── README.md            # Usage documentation
```

### Key Files to Know

- **main.ts**: CLI entry point using Yargs for command parsing
- **src/commands/**: Command implementations (get, set, inc, parse)
- **src/hooks/**: Post-increment hooks for updating project files
- **test/{node,helm,maven,dotnet}/**: Integration test scenarios
- **.github/workflows/checks.yml**: CI pipeline configuration

### Development Commands

```bash
# Check everything (expect lint failures)
deno task check

# Run just tests (fastest)
deno test

# Run integration tests
deno task test
```

### CI Integration

The GitHub Actions workflow requires:

- Deno v2.x setup
- Format check passes
- Lint check (ignores the 8 known failures)
- All tests pass
- Version parsing works

**Always validate your changes pass the same checks that CI runs.**

### Troubleshooting

1. **Import errors**: Dependencies download on first run - be patient
2. **Test failures**: Check for any environment-specific issues
3. **Compilation errors**: Expected due to environment limitations - focus on
   runtime testing
4. **Lint errors in deps/**: These are expected and don't break functionality
5. **Unwanted test file changes**: If you accidentally ran `inc` or `set`
   commands in test directories, revert with `git checkout HEAD -- test/` before
   committing

### Performance Expectations

- **Dependency download**: ~8-10 seconds on first run
- **Test execution**: ~1 second (32 tests)
- **Format check**: ~5 seconds
- **Lint check**: ~10 seconds
- **CLI commands**: ~1-2 seconds including startup

**NEVER CANCEL operations - they complete very quickly. Set timeouts of 60+
seconds minimum for safety.**
