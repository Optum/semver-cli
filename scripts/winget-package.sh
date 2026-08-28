#!/usr/bin/env bash
set -euo pipefail

# winget-package.sh - Package semver-cli for winget
# Creates ZIP file and generates winget manifest files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default values
RELEASE_MODE=false
VERSION=""
PACKAGE_DIR="${REPO_ROOT}/dist/winget"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --release)
      RELEASE_MODE=true
      shift
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--release] [--version VERSION]"
      exit 1
      ;;
  esac
done

# Get version if not provided
if [ -z "$VERSION" ]; then
  if [ -f "$REPO_ROOT/VERSION" ]; then
    VERSION=$(cat "$REPO_ROOT/VERSION")
  else
    echo "Error: VERSION file not found and --version not provided"
    exit 1
  fi
fi

echo "Packaging semver-cli version ${VERSION} for winget"
echo "Release mode: ${RELEASE_MODE}"

# Create output directory
mkdir -p "$PACKAGE_DIR"

# Function to package from local build
package_local() {
  echo "Packaging from local build..."
  
  # Check if binary exists
  if [ ! -f "$REPO_ROOT/bin/semver.exe" ]; then
    echo "Error: bin/semver.exe not found. Please build the Windows binary first."
    exit 1
  fi
  
  # Create ZIP file
  echo "Creating ZIP file..."
  cd "$REPO_ROOT/bin"
  zip -q "${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip" semver.exe
  cd - > /dev/null
  
  echo "ZIP created: ${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip"
}

# Function to package from GitHub release
package_release() {
  echo "Downloading from GitHub release ${VERSION}..."
  
  # Download the Windows exe asset
  asset_name="semver.x86_64-pc-windows-msvc.tar.gz"
  echo "Downloading ${asset_name}..."
  
  if ! gh release download "${VERSION}" --pattern "${asset_name}" --dir "${PACKAGE_DIR}" --repo Optum/semver-cli 2>/dev/null; then
    echo "Error: Failed to download ${asset_name} from release ${VERSION}"
    echo "Make sure the release exists and contains the Windows binary"
    exit 1
  fi
  
  # Extract the exe from tar.gz
  echo "Extracting exe from tar.gz..."
  cd "$PACKAGE_DIR"
  tar -xzf "$asset_name" semver.exe
  
  # Create ZIP file
  echo "Creating ZIP file..."
  zip -q "semver.x86_64-pc-windows-msvc.zip" semver.exe
  
  # Clean up
  rm -f "$asset_name" semver.exe
  cd - > /dev/null
  
  echo "ZIP created: ${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip"
}

# Package based on mode
if [ "$RELEASE_MODE" = true ]; then
  package_release
else
  package_local
fi

# Calculate SHA256
echo "Calculating SHA256..."
if command -v sha256sum &> /dev/null; then
  SHA256=$(sha256sum "${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip" | cut -d' ' -f1)
elif command -v shasum &> /dev/null; then
  SHA256=$(shasum -a 256 "${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip" | cut -d' ' -f1)
else
  echo "Error: No SHA256 tool found (sha256sum or shasum)"
  exit 1
fi

echo "SHA256: ${SHA256}"

# Determine installer URL
if [ "$RELEASE_MODE" = true ]; then
  INSTALLER_URL="https://github.com/Optum/semver-cli/releases/download/${VERSION}/semver.x86_64-pc-windows-msvc.zip"
else
  # For local builds, we'll upload the ZIP as an asset later
  INSTALLER_URL="__INSTALLER_URL__"
fi

# Get release date
if [ "$RELEASE_MODE" = true ]; then
  # Try to get from GitHub release
  RELEASE_DATE=$(gh release view "${VERSION}" --repo Optum/semver-cli --json publishedAt --jq '.publishedAt' 2>/dev/null | cut -d'T' -f1 || date -u +%Y-%m-%d)
else
  RELEASE_DATE=$(date -u +%Y-%m-%d)
fi

echo "Release date: ${RELEASE_DATE}"

# Generate manifest files
MANIFEST_DIR="${PACKAGE_DIR}/manifests/o/Optum/semver-cli/${VERSION}"
mkdir -p "$MANIFEST_DIR"

echo "Generating manifest files in ${MANIFEST_DIR}..."

# Copy and update installer manifest
sed -e "s|__VERSION__|${VERSION}|g" \
    -e "s|__RELEASE_DATE__|${RELEASE_DATE}|g" \
    -e "s|__INSTALLER_URL__|${INSTALLER_URL}|g" \
    -e "s|__INSTALLER_SHA256__|${SHA256}|g" \
    "${REPO_ROOT}/manifests/installer.yaml" > "${MANIFEST_DIR}/Optum.semver-cli.installer.yaml"

# Copy and update locale manifest
sed -e "s|__VERSION__|${VERSION}|g" \
    "${REPO_ROOT}/manifests/locale.en-US.yaml" > "${MANIFEST_DIR}/Optum.semver-cli.locale.en-US.yaml"

# Copy and update version manifest
sed -e "s|__VERSION__|${VERSION}|g" \
    "${REPO_ROOT}/manifests/version.yaml" > "${MANIFEST_DIR}/Optum.semver-cli.yaml"

echo "Manifest files generated:"
ls -la "${MANIFEST_DIR}"

# Output summary
cat << EOF

=================================================================
Winget Package Created Successfully
=================================================================
Version:      ${VERSION}
Package:      ${PACKAGE_DIR}/semver.x86_64-pc-windows-msvc.zip
SHA256:       ${SHA256}
Installer URL: ${INSTALLER_URL}
Manifests:    ${MANIFEST_DIR}
=================================================================

EOF

# Save metadata for publish script
cat > "${PACKAGE_DIR}/metadata.env" << EOF
VERSION=${VERSION}
SHA256=${SHA256}
INSTALLER_URL=${INSTALLER_URL}
RELEASE_DATE=${RELEASE_DATE}
MANIFEST_DIR=${MANIFEST_DIR}
EOF

echo "Metadata saved to ${PACKAGE_DIR}/metadata.env"
