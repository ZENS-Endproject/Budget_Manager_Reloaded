#STAGE 1
FROM node AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm run build
EXPOSE 5173 

COPY . .

#STAGE 2
FROM nginx:alpine
CMD ["npm", "start"]