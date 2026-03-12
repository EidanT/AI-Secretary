FROM node:18.19-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src ./src
RUN npx tsc
COPY .env.production ./
EXPOSE 3000
CMD ["npm", "start"]