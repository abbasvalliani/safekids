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

FROM nginx:alpine

COPY --from=builder /app/dist/apps/main-website-react/out /usr/share/nginx/html/
COPY --from=builder /app/apps/main-website-react/nginx-config.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]