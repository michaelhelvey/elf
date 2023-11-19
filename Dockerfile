FROM node:lts

ENV NODE_ENV production

WORKDIR /app

COPY package.json .
COPY public public
COPY remix.config.js .
COPY node_modules node_modules
COPY src src
COPY build build

CMD ["npm", "start"]
