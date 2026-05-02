FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN DATABASE_URL=postgresql://build:build@localhost/build pnpm exec prisma generate
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules ./node_modules

COPY package.json ./
COPY --from=builder /app/prisma.config.ts ./
COPY prisma ./prisma
COPY data ./data

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
