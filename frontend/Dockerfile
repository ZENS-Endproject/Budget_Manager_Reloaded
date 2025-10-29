# STAGE 1
FROM node AS builder


WORKDIR /app


COPY . .

RUN npm install
RUN npm run build
EXPOSE 5173

# STAGE 2
FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80