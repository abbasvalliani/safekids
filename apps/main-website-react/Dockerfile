FROM node:slim AS builder

ARG GIT_TAG=unknown
ENV NEXT_PUBLIC_GIT_TAG=${GIT_TAG}

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN version=$(grep 'packageManager' package.json | awk -F'"' '{print $4}' | awk -F'@' '{print $2}') && npm install -g "pnpm@$version"

COPY nx.json tsconfig.base.json ./
RUN pnpm install --ignore-scripts --frozen-lockfile
COPY . .
RUN pnpm run homepage

# nginx-unprivileged is the NGINX-maintained image that runs as the non-root
# nginx user (uid/gid 101) out of the box: pid file and temp paths live in /tmp,
# so nothing under /etc, /var/cache or /usr/share needs to be writable.
FROM nginxinc/nginx-unprivileged:alpine

# Content and config are copied as root-owned, world-readable files: the nginx
# user only needs to read them.
COPY --from=builder /app/dist/apps/main-website-react/out /usr/share/nginx/html/
COPY --from=builder /app/apps/main-website-react/nginx-config.conf /etc/nginx/conf.d/default.conf

# Numeric so Kubernetes can verify runAsNonRoot without a runAsUser override.
USER 101:101
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]