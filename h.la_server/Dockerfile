FROM node

WORKDIR /usr/src/app

COPY app/package.json ./
RUN npm install
COPY app .
RUN npm install -g nodemon

ENV PORT=80

CMD [ "nodemon", "-L", "./bin/www" ]