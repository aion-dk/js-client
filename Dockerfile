FROM node:24-bullseye-slim

WORKDIR /usr/src/app

RUN yes | apt-get update && yes | apt-get install curl \
    && chown -R node:node /usr/src/app

USER node

COPY --chown=node:node package.json yarn.lock ./

RUN yarn install --immutable

COPY --chown=node:node . .

RUN yarn build
