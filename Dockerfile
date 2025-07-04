FROM node:22-alpine

RUN npm i -g @nestjs/cli@10.2.1

WORKDIR /app
COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm","run","start:prod"]