FROM node:10.13-alpine
WORKDIR /usr/app
COPY ["./package.json", "./package-lock.json*", "./"]
RUN npm install --production 
COPY . .
CMD node index.js
