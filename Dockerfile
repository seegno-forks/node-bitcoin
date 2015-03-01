FROM mhart/alpine-iojs:3.0.0

RUN apk add --update git && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install

COPY . /usr/src/app/

CMD ["npm", "run", "testonly"]
