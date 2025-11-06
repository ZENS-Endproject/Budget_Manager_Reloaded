FROM node:20

WORKDIR /app


RUN apt-get update && \
    apt-get install -y postgresql-client curl bash && \
    rm -rf /var/lib/apt/lists/*
#RUN apk add --no-cache postgresql-client bash curl

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5005

CMD ["node", "index.js"]