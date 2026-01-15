FROM node:20-alpine

WORKDIR /app

# Package files kopieren
COPY package*.json ./

# Dependencies installieren
RUN npm install

# Source code kopieren
COPY . .

# Build (für Production)
RUN npm run build

# Port expose
EXPOSE 4321

# Start command
CMD ["npm", "run", "dev"]
