# Use Node.js 22 LTS (Jod)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
# We use 'npm ci' for a clean, reproducible install based on package-lock.json
# We also install openssl because Prisma needs it on Alpine Linux
RUN apk add --no-cache openssl && npm ci

# Copy the rest of the backend code
COPY . .

# Generate Prisma Client
# FIX: Pass a dummy DATABASE_URL so generation succeeds during build.
# The real URL will be provided by Docker Compose at runtime.
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Command to run the app
# 1. Run Migrations (apply schema changes)
# 2. Run Seed (ensure admin user exists)
# 3. Start Server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node index.js"]