FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl libssl-dev

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 4000

CMD [ "npm", "run", "start" ]
