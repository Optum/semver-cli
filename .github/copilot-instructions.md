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
   DENO_TLS_CA_STORE=system deno task test
   ```
   - Takes ~1 second for 32 tests, NEVER CANCEL
   - Set timeout to 60+ seconds minimum for safety

### SSL Certificate Issues (CRITICAL)

This environment has SSL certificate validation issues. Use one of these
approaches:

**Option 1 (Preferred)**: Use environment variable

```bash
DENO_TLS_CA_STORE=system deno [command]
```

**Option 2**: Use unsafe flag (only when Option 1 fails)

```bash
deno run --unsafely-ignore-certificate-errors -A main.ts [args]
```

### Running the CLI Tool

**Basic usage**:

```bash
# With SSL fix
DENO_TLS_CA_STORE=system deno run -A main.ts --help
DENO_TLS_CA_STORE=system deno run -A main.ts get
DENO_TLS_CA_STORE=system deno run -A main.ts parse

# If SSL issues persist, use:
deno run --unsafely-ignore-certificate-errors -A main.ts --help
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
   DENO_TLS_CA_STORE=system deno task test
   ```

3. **Manual CLI validation** - Test core functionality:
   ```bash
   cd /tmp && mkdir semver-validation && cd semver-validation
   echo "1.0.0" > VERSION

   # Test basic commands
   DENO_TLS_CA_STORE=system deno run -A /path/to/semver-cli/main.ts get      # Should output: 1.0.0
   DENO_TLS_CA_STORE=system deno run -A /path/to/semver-cli/main.ts inc patch  # Should output: 1.0.1
   DENO_TLS_CA_STORE=system deno run -A /path/to/semver-cli/main.ts get      # Should output: 1.0.1
   cat VERSION  # Should contain: 1.0.1
   ```

4. **Project integration validation** - Test post-hooks work:
   ```bash
   # Test Node.js integration
   cd test/node && DENO_TLS_CA_STORE=system deno run -A ../../main.ts get

   # Test other project types
   cd ../helm && DENO_TLS_CA_STORE=system deno run -A ../../main.ts get
   cd ../maven && DENO_TLS_CA_STORE=system deno run -A ../../main.ts get  
   cd ../dotnet && DENO_TLS_CA_STORE=system deno run -A ../../main.ts get
   ```

### Known Limitations

- **Compilation fails**: `deno compile` fails due to network restrictions - this
  is expected
- **Lint errors**: 8 import prefix lint errors are expected and don't affect
  functionality
- **Global install**: The install task is missing `--global` flag - add it if
  needed

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
DENO_TLS_CA_STORE=system deno test

# Run integration tests
DENO_TLS_CA_STORE=system deno task test
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

1. **SSL/TLS errors**: Use `DENO_TLS_CA_STORE=system` or
   `--unsafely-ignore-certificate-errors`
2. **Import errors**: Dependencies download on first run - be patient
3. **Test failures**: Usually due to SSL issues - use the certificate
   workarounds
4. **Compilation errors**: Expected due to environment limitations - focus on
   runtime testing
5. **Lint errors in deps/**: These are expected and don't break functionality

### Performance Expectations

- **Dependency download**: ~8-10 seconds on first run
- **Test execution**: ~1 second (32 tests)
- **Format check**: ~5 seconds
- **Lint check**: ~10 seconds
- **CLI commands**: ~1-2 seconds including startup

**NEVER CANCEL operations - they complete very quickly. Set timeouts of 60+
seconds minimum for safety.**
