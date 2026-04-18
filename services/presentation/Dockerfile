# Presentation Service Dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . /app
EXPOSE 3000
CMD ["npm", "start"]
