
# STAGE 1
FROM node:22 AS builder


WORKDIR /app

# Build argument for React API URL
ARG REACT_APP_API_URL

# Set environment variable
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .

RUN npm install
RUN npm run build
#RUN NODE_OPTIONS="--localstorage-file=/tmp/localstorage.json" npm run build
EXPOSE 5173

# STAGE 2
FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf

COPY fullchain.pem /etc/nginx/fullchain.pem
COPY privkey.pem /etc/nginx/privkey.pem
COPY options-ssl-nginx.conf /etc/nginx/options-ssl-nginx.conf
COPY ssl-dhparams.pem /etc/nginx/ssl-dhparams.pem

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
