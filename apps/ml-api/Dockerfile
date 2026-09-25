FROM node:slim AS builder

ARG API_PORT=3000
ENV API_PORT=$API_PORT

ARG GIT_TAG=unknown
ENV GIT_TAG=${GIT_TAG}

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') && npm install -g "pnpm@$version"
RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .

RUN pnpm run api

EXPOSE $API_PORT

ENV NODE_ENV=production
ENV APP_ENV=production

# Run as the node image's built-in non-root `node` user (uid/gid 1000). The code,
# node_modules and model_files stay root-owned and read-only to it; the only
# path the api writes is the winston daily-rotate log directory, `logs/`
# relative to the working directory (config/winston.ts, config/logger.config.ts).
RUN mkdir -p /app/logs && chown 1000:1000 /app/logs
# Numeric so Kubernetes can verify runAsNonRoot without a runAsUser override.
USER 1000:1000

#CMD ["tail", "-f", "/dev/null"]
CMD ["node", "dist/apps/ml-api/main.js"]
