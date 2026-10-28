# syntax=docker/dockerfile:1
# Base images are pinned by version AND digest (resolve with `crane digest`).
FROM node:24.22.1-trixie-slim@sha256:89c5244bc22a9bc3287d89ebc7e49b9cb5bb84cd40e6175ac3421d5a9f68b95a AS builder

ARG GIT_TAG=unknown
ENV NEXT_PUBLIC_GIT_TAG=${GIT_TAG}

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') \
 && npm install -g --ignore-scripts "pnpm@$version"

COPY nx.json tsconfig.base.json ./
RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .
RUN pnpm run homepage

# nginx-unprivileged (stable 1.30 line) is the NGINX-maintained image that runs
# as the non-root nginx user (uid/gid 101) out of the box: pid file and temp
# paths live in /tmp, so only /tmp needs to be writable (readOnlyRootFilesystem
# + an emptyDir at /tmp).
FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03

# Pull in Alpine security fixes released since the base image was built.
USER root
RUN apk upgrade --no-cache

# Content and config are copied as root-owned, world-readable files: the nginx
# user only needs to read them.
COPY --from=builder /app/dist/apps/main-website-react/out /usr/share/nginx/html/
COPY --from=builder /app/apps/main-website-react/nginx-config.conf /etc/nginx/conf.d/default.conf
RUN chmod -R a+rX /usr/share/nginx/html

# Numeric so Kubernetes can verify runAsNonRoot without a runAsUser override.
USER 101:101
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
