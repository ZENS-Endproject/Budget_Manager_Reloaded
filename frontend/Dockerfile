
# STAGE 1
FROM node AS builder


WORKDIR /app

# Build argument for React API URL
ARG REACT_APP_API_URL

# Set environment variable
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .

RUN npm install
RUN npm run build --verbose
EXPOSE 5173

# STAGE 2
FROM nginx:alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80