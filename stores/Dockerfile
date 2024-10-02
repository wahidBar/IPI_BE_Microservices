FROM node

WORKDIR /app/stores

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8094

CMD ["npm", "start"]