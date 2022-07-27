FROM node:18-buster-slim

WORKDIR /usr/src/app

RUN yes | apt-get update && yes | apt-get install curl

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn run build && yarn run webpack
