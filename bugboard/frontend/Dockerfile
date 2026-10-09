# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Production Nginx runtime (Multi-stage build)
FROM nginxinc/nginx-unprivileged:alpine

USER root
RUN apk update && apk upgrade --no-cache && rm -rf /var/cache/apk/*
USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
