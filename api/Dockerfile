FROM node:lts-alpine AS base

WORKDIR /repo

COPY package*.json ./
COPY api/package.json api/
COPY shared/common/package.json shared/common/
COPY shared/internal/package.json shared/internal/

FROM base AS dev-deps

RUN npm ci --workspaces

FROM dev-deps AS dev

ENV NODE_ENV=dev

WORKDIR /repo/api

CMD ["npx", "nodemon", "main.js"]


FROM base AS prod-deps

RUN npm ci --workspace=@ddns/api --omit=dev

FROM prod-deps AS prod

ENV NODE_ENV=prod

WORKDIR /repo/api

COPY ./api /repo/api/
COPY ./shared /repo/shared/

EXPOSE 3000

CMD ["node", "main.js"]
