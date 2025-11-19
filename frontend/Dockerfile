# --- Stage 1: Build the React App ---
# Use Node.js 22 LTS (Jod) to match backend
FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the app for production (outputs to /dist)
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy the build output from the previous stage to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]