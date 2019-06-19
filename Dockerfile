FROM node:10-alpine

LABEL name "Artemis API"
LABEL version "0.1.0"
LABEL maintainer "Kiru <me@kiru.space>"

WORKDIR /usr/src/artemis-api

COPY package.json yarn.lock ./

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install \
&& apk del .build-deps

COPY . .

EXPOSE 4445

CMD ["node", "server.js"]
