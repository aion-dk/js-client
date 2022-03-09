FROM node:14.17.0-alpine

WORKDIR /usr/src/app

RUN apk add curl

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
