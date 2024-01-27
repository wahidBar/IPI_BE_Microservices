FROM node

WORKDIR /app/shopping

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8400

CMD ["npm", "start"]