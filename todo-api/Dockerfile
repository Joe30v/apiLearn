FROM node:22-slim

WORKDIR /app

# Install deps first so this layer is cached when only source changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
