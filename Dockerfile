FROM node:24-bullseye-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && chown -R node:node /usr/src/app

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --immutable

COPY --chown=node:node . .

RUN yarn build
