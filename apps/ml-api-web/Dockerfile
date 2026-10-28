# syntax=docker/dockerfile:1
# Not published by any workflow today; kept buildable and hardened like the
# others. Base images are pinned by version AND digest.
FROM node:24.22.1-trixie-slim@sha256:89c5244bc22a9bc3287d89ebc7e49b9cb5bb84cd40e6175ac3421d5a9f68b95a AS builder
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') \
 && npm install -g --ignore-scripts "pnpm@$version"

RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .

ENV API_URL=$API_URL
ENV NODE_ENV=production

RUN pnpm run web

# Non-root nginx (uid/gid 101); scripts/vite-nginx.conf listens on 8080.
FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03 AS deployer

USER root
RUN apk upgrade --no-cache

COPY --from=builder /build/dist/apps/ml-api-web /usr/share/nginx/html/
COPY --from=builder /build/scripts/vite-nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R a+rX /usr/share/nginx/html

USER 101:101
EXPOSE 8080
