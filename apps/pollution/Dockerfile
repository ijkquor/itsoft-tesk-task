FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libgif-dev \
    libpixman-1-dev \
    libpangomm-1.4-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

COPY ../.env .env

RUN yarn build

EXPOSE 3001

CMD ["node", "dist/apps/pollution/src/main.js"] 
