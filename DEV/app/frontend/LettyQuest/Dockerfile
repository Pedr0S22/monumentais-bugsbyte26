FROM node:20-slim

WORKDIR /app

# Instala o CLI do expo globalmente
RUN npm install -g expo-cli

# Copia os ficheiros de dependências
COPY package*.json ./
RUN npm install

# Copia o resto do código
COPY . .

# Porta padrão do Expo
EXPOSE 8081

CMD ["npx", "expo", "start", "--dev-client", "--host", "lan"]