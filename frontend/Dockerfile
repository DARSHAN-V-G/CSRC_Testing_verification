FROM node:18-slim
WORKDIR /app

COPY csrc/package.json csrc/package-lock.json ./
RUN npm install

COPY csrc/ ./
ARG VITE_BASE_API_URL
ENV VITE_BASE_API_URL=$VITE_BASE_API_URL
RUN npm run build


EXPOSE 5173

# Start Nginx server
#CMD ["npm","run","dev","--","--host","0.0.0.0","--base=/testing/"]
CMD ["npm","run","dev","--","--host"]
#CMD ["npm","serve","-s","dist"]