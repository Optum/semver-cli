FROM denoland/deno:alpine-2.4.0@sha256:fcf215ca621c2834157dcb8a8c8c48b64d273b542b4fc8baee1b5c6de50b326c

# Label the container
LABEL maintainer="Justin Chase <justin.chase@optum.com>"
LABEL repository="https://github.com/optum/semver-cli"
LABEL homepage="https://github.com/optum/semver-cli"

# Label as GitHub action
LABEL com.github.actions.name="semver-cli"

# Limit to 160 characters
LABEL com.github.actions.description="Get, set and increment your project version"

# See branding:
# https://docs.github.com/actions/creating-actions/metadata-syntax-for-github-actions#branding
LABEL com.github.actions.icon="activity"
LABEL com.github.actions.color="orange"

WORKDIR /app
ENV PATH="/app/bin:${PATH}"
RUN mkdir -p /app/bin

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps/ /app/deps
COPY deno.json /app/
COPY deno.lock /app/
RUN deno cache --allow-import deps/mod.ts

# These steps will be re-run upon any file change in your working directory:
ADD src /app/src
ADD main.ts /app

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts
RUN deno compile --allow-run --allow-env --allow-read --allow-write -o bin/semver main.ts
ENTRYPOINT ["semver"]
