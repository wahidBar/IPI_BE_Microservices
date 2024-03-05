FROM node

WORKDIR /app/products

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8092

CMD ["npm", "start"]