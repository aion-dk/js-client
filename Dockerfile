FROM node:14.17.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install && npm install --global http-server

COPY . .

EXPOSE 3005

RUN npm run build && npm run webpack

CMD ["http-server", "--cors", "-a 0.0.0.0", "-p 3005", "-c -1"]
