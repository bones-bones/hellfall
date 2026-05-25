FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/ .yarn/
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/frontend/package.json packages/frontend/
COPY packages/backend/package.json packages/backend/
COPY packages/scripts/package.json packages/scripts/

RUN yarn install --immutable

COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/
COPY packages/scripts/ packages/scripts/

RUN yarn workspace @hellfall/server build:prod

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV DATA_DIR=/app/data

RUN npm install @google-cloud/firestore@7 dotenv@16 xmldom@0.6.0

COPY --from=builder /app/packages/server/dist/server.mjs ./
COPY --from=builder /app/packages/shared/src/data/Hellscube-Database.json /app/data/
COPY --from=builder /app/packages/shared/src/data/tags.json /app/data/

EXPOSE 8080
CMD ["node", "server.mjs"]
