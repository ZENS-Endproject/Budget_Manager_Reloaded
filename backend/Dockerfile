FROM node:20-alpine

WORKDIR /app

# Installer le client PostgreSQL
#RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 5005

CMD ["node", "index.js"]