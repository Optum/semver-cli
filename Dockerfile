FROM debian:stable@sha256:e822570981e13a6ef1efcf31870726fbd62e72d9abfdcf405a9d8f566e8d7028

# Label the container
LABEL maintainer="Justin Chase <justin.chase@optum.com>"
LABEL repository="https://github.com/optum/semver-cli"
LABEL homepage="https://github.com/optum/semver-cli"

WORKDIR /app
RUN mkdir -p /app/.bin
ENV PATH=/app/.bin:$PATH

# Install basics
RUN apt update && apt install -y \
  ca-certificates \
  curl

RUN VERSION=0.3.0; \
  curl -o  .bin/semver.x86_64-unknown-linux-gnu.tar.gz "https://github.com/Optum/semver-cli/releases/download/$VERSION/semver.x86_64-unknown-linux-gnu.tar.gz" -L && \
  tar -xzf .bin/semver.x86_64-unknown-linux-gnu.tar.gz -C .bin/ && \
  chmod +x .bin/semver

ENTRYPOINT ["semver"]
