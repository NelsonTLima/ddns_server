# ------ Stage: COPY manifests ----
FROM node:lts-alpine AS base

WORKDIR /repo

COPY package*.json ./
COPY workers/package.json workers/
COPY shared/common/package.json shared/common/
COPY shared/internal/package.json shared/internal/

# ------ Stage: Installing dev dependencies 
FROM base AS dev-deps

RUN npm ci --workspaces

# ----- Target 1: Run Dev -----------
FROM dev-deps AS dev

ENV NODE_ENV=dev
ENV NODE_OPTIONS=--conditions=development

WORKDIR /repo/workers

CMD ["npm", "run", "dev"]


# -------Stage: Build -----------
FROM dev-deps AS  build

WORKDIR /repo

COPY ./workers /repo/workers
COPY ./shared /repo/shared

RUN npm run -ws build

# ----- Stage: Install Prod Dependencies
FROM base AS prod-deps

RUN npm ci --workspaces --omit=dev

# -------Target 2: PROD  ------------
FROM node:lts-alpine AS prod

ENV NODE_ENV=production
ENV NODE_OPTIONS=--conditions=production

COPY --from=prod-deps /repo/node_modules /repo/node_modules

COPY --from=build /repo/workers/dist /repo/workers/dist
COPY --from=build /repo/workers/package.json /repo/workers/package.json

COPY --from=build /repo/shared/common/dist /repo/shared/common/dist
COPY --from=build /repo/shared/common/package.json /repo/shared/common/package.json 

COPY --from=build /repo/shared/internal/dist /repo/shared/internal/dist
COPY --from=build /repo/shared/internal/package.json /repo/shared/internal/package.json

WORKDIR /repo/workers

# CMD ["sleep", "infinity"] # Debug
CMD ["npm", "run", "start"]
