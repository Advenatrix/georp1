# Dockerfile
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests & install prod deps only
COPY package*.json ./
RUN npm ci --production

# Copy the rest of your code
COPY . .

# Run your bot
CMD [ "node", "index.js" ]
