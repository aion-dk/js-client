FROM node:24-bullseye-slim

WORKDIR /usr/src/app

RUN yes | apt-get update && yes | apt-get install curl

COPY package.json yarn.lock ./

RUN yarn install --immutable

COPY . .

RUN yarn build
