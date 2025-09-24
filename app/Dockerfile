FROM node:lts-alpine AS base

WORKDIR /repo

COPY package*.json ./
COPY app/package.json app/
COPY shared/common/package.json shared/common/

FROM base AS deps

RUN npm ci --workspaces

FROM deps AS dev

ENV NODE_ENV=development

WORKDIR /repo/app

EXPOSE 5173

CMD ["npm", "run", "dev"]

FROM deps AS builder

ARG VITE_API_PATH
ENV VITE_API_PATH=${VITE_API_PATH}}

COPY ./app /repo/app/
COPY ./shared/common /repo/shared/common/

WORKDIR /repo/app
RUN npm run build

FROM nginx:stable-alpine-slim AS prod

ENV NODE_ENV=production

WORKDIR /usr/share/nginx/html/

COPY --from=builder /repo/app/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder repo/app/dist /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
