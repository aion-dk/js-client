FROM node:14.17.0-alpine

WORKDIR /usr/src/app

RUN apk add curl

COPY package*.json ./

COPY ./dist/bundle.js ./public/

RUN npm install

COPY . .

RUN npm run build && npm run webpack

CMD ["npm run server"]
