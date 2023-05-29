FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 4003
CMD ["npm", "run", "start:prod"]