FROM node:24-alpine
USER root
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN mkdir /pnpm
RUN apk update && apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm --activate
RUN pnpm config set global-bin-dir /pnpm/bin --global

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile && pnpm add -g typescript
COPY src/ ./src/
COPY tsconfig.json ./
COPY bot.d.ts ./
RUN pnpm run build

EXPOSE 5000
ENV PORT 5000
LABEL org.opencontainers.image.source="https://github.com/aelithron/mc-sticker-tooling"
CMD ["node", "dist/index.js"]