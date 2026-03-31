FROM node:20-alpine

WORKDIR /app/users

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8094

# ENV npm_config_build_from_source=true

CMD ["npm", "start"]