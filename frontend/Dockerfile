FROM node:18-slim
WORKDIR /app

COPY csrc/package.json csrc/package-lock.json ./
RUN npm install

COPY csrc/ ./

RUN npm run build


EXPOSE 5173

# Start Nginx server
CMD ["npm","run","dev"]