FROM denoland/deno:alpine-2.0.3@sha256:6d96757fb945c044f6fd831dbea8a1d065fcb4f5da398c9b40c58424542c9b11

# Label the container
LABEL maintainer="Justin Chase <justin.chase@optum.com>"
LABEL repository="https://github.com/optum/semver-cli"
LABEL homepage="https://github.com/optum/semver-cli"

WORKDIR /app
ENV PATH="/app/bin:${PATH}"
RUN mkdir -p /app/bin

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps/ /app/deps
COPY deno.json /app/
COPY deno.lock /app/
RUN deno cache --lock-write deps/mod.ts

# These steps will be re-run upon any file change in your working directory:
ADD src /app/src
ADD main.ts /app

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts
RUN deno compile --allow-run --allow-env --allow-read --allow-write -o bin/semver main.ts
ENTRYPOINT ["semver"]
