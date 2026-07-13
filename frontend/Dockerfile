FROM node:18-alpine

WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Очищаем кэш npm и устанавливаем зависимости
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# Копируем код
COPY . .

EXPOSE 3000

CMD ["npm", "start"]