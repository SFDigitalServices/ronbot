FROM node:latest

# these args are populated via docker-compose.yml, which gets the values from the .env file via the env_file key
# they are needed for preinstall.js in order to create the google creds for the sheets api
ARG GOOGLE_CONFIG

ARG GOOGLE_APPLICATION_CREDENTIALS

RUN mkdir -p /home/node/app/node_modules \
    && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./

COPY preinstall.js ./

USER node

RUN npm install

COPY --chown=node:node . .

EXPOSE 4390

CMD [ "npm", "run", "start.dev" ]
