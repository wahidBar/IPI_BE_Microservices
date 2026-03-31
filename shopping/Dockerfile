FROM node:20-alpine

WORKDIR /app/shopping

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8096

CMD ["npm", "start"]