FROM node:24-alpine
WORKDIR /app

# Install pnpm and dependencies first (for caching)
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the code
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start the Next.js development server
CMD ["pnpm", "dev", "--", "-H", "0.0.0.0"]
