# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.cjs postcss.config.cjs ./
COPY src ./src
COPY index.html ./
COPY .env.example ./
ARG VITE_API_BASE_URL=http://localhost:8000/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm install
RUN npm run build


