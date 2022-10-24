# build
FROM node:18-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --immutable --immutable-cache --check-cache
COPY . .
RUN npm run build

#serve
FROM nginx:stable-alpine

ENV NODE_ENV production
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
