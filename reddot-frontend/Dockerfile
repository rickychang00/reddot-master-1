# STAGE 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090
ENV NEXT_PUBLIC_POCKETBASE_URL=$NEXT_PUBLIC_POCKETBASE_URL
RUN npm run build

# STAGE 2: Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built application and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy public folder only if it exists in builder
COPY --from=builder /app/public* ./public/

EXPOSE 3000
CMD ["npm", "start"]
