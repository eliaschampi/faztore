FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache bash postgresql-client
COPY package*.json ./
RUN npm install
# Pre-install tsx globally to avoid interactive prompts
RUN npm install -g tsx
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]