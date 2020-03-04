FROM node:10.13-alpine
WORKDIR /usr/app
COPY ["./package.json", "./package-lock.json*", "./"]
RUN npm install --production --silent
COPY . .
EXPOSE 80
CMD node index.js