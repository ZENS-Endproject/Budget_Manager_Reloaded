FROM node:20-alpine

WORKDIR /app

# Installer le client PostgreSQL
#RUN apt update && apt install -y postgresql-client && rm -rf /var/lib/apt/lists/*
RUN apk add --no-cache postgresql-client bash curl

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5005

CMD ["node", "index.js"]
