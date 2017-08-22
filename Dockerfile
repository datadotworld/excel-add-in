FROM node:boron

# Create an app directory
WORKDIR /usr/src/app

# Install app depdencies
COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3001
CMD [ "yarn", "run", "prod" ]
