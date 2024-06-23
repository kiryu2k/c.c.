FROM node:22-alpine3.19 as builder

WORKDIR /app

COPY ./client/package.json ./client/package-lock.json ./

RUN npm install

COPY ./client ./

RUN npm run build

FROM nginx:stable-alpine as runner

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]