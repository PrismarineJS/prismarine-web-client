FROM node:14-alpine
# Without git installing the npm packages fails
RUN apk add git
RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build
ENTRYPOINT ["npm", "run", "prod-start"]
