FROM node:22-alpine

WORKDIR /app

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the client frontend
RUN npm run build

# Expose port 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start Express server using tsx
CMD ["npx", "tsx", "server.ts"]
