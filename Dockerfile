FROM node:16-alpine

WORKDIR /code

COPY ./ /code

RUN npm install -g nodemon yarn bower pm2

RUN yarn && bower install

EXPOSE 8001

CMD ["yarn build && pm2 start app.js"]
