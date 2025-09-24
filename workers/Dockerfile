FROM node:lts-alpine AS base

WORKDIR /repo

COPY package*.json ./
COPY workers/package.json workers/
COPY shared/common/package.json shared/common/
COPY shared/internal/package.json shared/internal/

FROM base AS dev-deps

RUN npm ci --workspaces

FROM dev-deps AS dev

ENV NODE_ENV=dev

WORKDIR /repo/workers

CMD ["npx", "nodemon", "main.js"]


FROM base AS prod-deps

RUN npm ci --workspace=@ddns/workers --omit=dev

FROM prod-deps AS prod

ENV NODE_ENV=prod

WORKDIR /repo/workers

COPY ./workers /repo/workers/
COPY ./shared /repo/shared/

CMD ["node", "main.js"]
