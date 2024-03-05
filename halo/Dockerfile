FROM node

WORKDIR /app/users

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8093

# ENV npm_config_build_from_source=true

CMD ["npm", "start"]