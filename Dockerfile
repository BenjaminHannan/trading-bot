FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm run build
CMD ["node", "dist/src/trader/index.js"]
