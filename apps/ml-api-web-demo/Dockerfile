FROM node:slim AS builder
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') && npm install -g "pnpm@$version"

RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .

ENV API_URL=$API_URL
ENV NODE_ENV=production
ARG GIT_TAG=unknown
ENV GIT_TAG=$GIT_TAG

RUN pnpm run web-demo

# nginx-unprivileged is the NGINX-maintained image that runs as the non-root
# nginx user (uid/gid 101) out of the box: pid file and temp paths live in /tmp,
# so nothing under /etc, /var/cache or /usr/share needs to be writable.
FROM nginxinc/nginx-unprivileged:alpine AS deployer

# Content and config are root-owned; the nginx user only needs to read them.
# The demo has its own nginx.conf (listen 8080) — scripts/vite-nginx.conf is
# still used by apps/ml-api-web, which runs stock nginx on :80.
COPY --from=builder /build/dist/apps/ml-api-web-demo /usr/share/nginx/html/
COPY --from=builder /build/apps/ml-api-web-demo/nginx.conf /etc/nginx/conf.d/default.conf
USER root
RUN chmod -R a+rX /usr/share/nginx/html

# Numeric so Kubernetes can verify runAsNonRoot without a runAsUser override.
USER 101:101
EXPOSE 8080
