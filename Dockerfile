FROM node:20-alpine

WORKDIR /app

ARG ENVIRONMENT
ENV ENVIRONMENT=${ENVIRONMENT:-PRODUCTION}

# Install bash and upgrade npm to latest version
RUN apk add --no-cache bash && npm install -g npm@latest serve

COPY package.json ./
COPY package-lock.json ./

RUN npm install --silent

COPY . ./

RUN ./scripts/build.sh

# start app
CMD ./variables.sh build && serve -s -l tcp://0.0.0.0:3000 build/
