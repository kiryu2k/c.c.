FROM node:22-alpine3.19

WORKDIR /app

COPY ./server/package.json ./server/package-lock.json ./

RUN npm install

COPY ./server ./

EXPOSE 8080

CMD npm start