FROM node:16-alpine

WORKDIR /code

COPY ./ /code

RUN apt install git

RUN npm install -g nodemon bower pm2

RUN yarn && bower install

EXPOSE 8001

CMD ["yarn build && pm2 start app.js"]
