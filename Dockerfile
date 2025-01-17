FROM node:22-bullseye-slim

WORKDIR /usr/src/app

RUN yes | apt-get update && yes | apt-get install curl

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn run build && yarn run webpack
