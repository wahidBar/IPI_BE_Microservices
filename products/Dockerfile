FROM node:20-alpine

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8093

CMD ["npm", "start"]