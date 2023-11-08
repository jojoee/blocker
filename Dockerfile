# ---- Base Node ----
FROM --platform=linux/amd64 node:10.19.0 as base
WORKDIR /app
COPY package*.json ./
COPY bower.json ./
COPY .bowerrc ./

# ---- Dependencies ----
FROM base AS dependencies
COPY package*.json ./
COPY bower.json ./
COPY .bowerrc ./
RUN npm install -g bower
RUN bower install --allow-root
RUN npm install 

# ---- Build ----
FROM dependencies AS build
COPY . .
RUN DEBUG= npm run build

# ---- Release ----
FROM --platform=linux/amd64 node:10.19.0 as release
WORKDIR /app
COPY --from=dependencies /app/node_modules /app/node_modules
COPY --from=dependencies /app/public/bower_components /app/public/bower_components
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json
COPY --from=build /app/public/dist /app/public/dist

RUN npm ci --only=production

# remove development dependencies
RUN npm prune --production

COPY . .

EXPOSE 8001

CMD [ "node", "app.js" ]
