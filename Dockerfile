# build
FROM node:18-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --immutable --immutable-cache --check-cache
COPY . .

ARG TURN_CREDENTIAL_ARG
ENV REACT_APP_TURN_CREDENTIAL $TURN_CREDENTIAL_ARG

ARG TURN_USER_ARG
ENV REACT_APP_TURN_USER $TURN_USER_ARG

RUN npm run build

#serve
FROM nginx:stable-alpine

ENV NODE_ENV production
ENV PORT=3000

COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE $PORT

#CMD ["nginx", "-g", "daemon off;"]
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'