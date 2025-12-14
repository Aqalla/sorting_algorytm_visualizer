FROM node:20-alpine

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

