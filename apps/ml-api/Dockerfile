# syntax=docker/dockerfile:1
# Base images are pinned by version AND digest (resolve with `crane digest`).
# Node 24 is the Active LTS line. trixie (Debian 13) rather than the bookworm
# `-slim` default: same Node build, but no zlib1g CRITICAL and fewer HIGH OS CVEs.
ARG NODE_IMAGE=node:24.22.1-trixie-slim@sha256:89c5244bc22a9bc3287d89ebc7e49b9cb5bb84cd40e6175ac3421d5a9f68b95a

# ---------------------------------------------------------------------------
# builder: full monorepo install (incl. dev deps) + webpack build of the api.
# Nothing from this stage ships except dist/ and the pruned prod node_modules.
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') \
 && npm install -g --ignore-scripts "pnpm@$version"
RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .

RUN pnpm run api

# Install ONLY the runtime externals the api imports. The webpack build
# (generatePackageJson) writes a package.json + pruned pnpm-lock.yaml listing
# just those, so dev tooling (nx, webpack, esbuild, jest, ...) and the
# frontend-only deps of the monorepo never reach the runtime image.
WORKDIR /runtime-deps
RUN cp /app/dist/apps/ml-api/package.json /app/dist/apps/ml-api/pnpm-lock.yaml ./ \
 && pnpm install --prod --frozen-lockfile --ignore-scripts --config.node-linker=hoisted

# ---------------------------------------------------------------------------
# runtime
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime

ARG API_PORT=3000
ENV API_PORT=$API_PORT
ARG GIT_TAG=unknown
ENV GIT_TAG=${GIT_TAG}
ENV NODE_ENV=production
ENV APP_ENV=production

# The runtime never installs packages: drop npm/corepack (and their bundled
# node_modules, a recurring source of CVEs) from the final image.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

WORKDIR /app
# Layout matches the previous image: cwd /app, bundle in dist/apps/ml-api,
# ONNX models in model_files/ (config/model.ts default paths are cwd-relative).
COPY --from=builder /runtime-deps/node_modules ./node_modules
COPY --from=builder /app/dist/apps/ml-api ./dist/apps/ml-api
COPY model_files ./model_files

# Run as the node image's built-in non-root `node` user (uid/gid 1000). The code,
# node_modules and model_files stay root-owned and read-only to it; the only
# path the api writes is the winston daily-rotate log directory, `logs/`
# relative to the working directory (config/winston.ts, config/logger.config.ts).
# Under readOnlyRootFilesystem mount an emptyDir at /app/logs (and /tmp).
RUN mkdir -p /app/logs && chown 1000:1000 /app/logs
# Numeric so Kubernetes can verify runAsNonRoot without a runAsUser override.
USER 1000:1000

EXPOSE $API_PORT
CMD ["node", "dist/apps/ml-api/main.js"]
