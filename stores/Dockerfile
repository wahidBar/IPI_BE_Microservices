FROM node:20-alpine

WORKDIR /app/stores

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8095

CMD ["npm", "start"]