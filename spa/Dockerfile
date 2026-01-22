FROM node:24-alpine

WORKDIR /app

# Copy package.json and package-lock.json (if exists) and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Vite needs --host to be accessible from the Docker network
CMD ["npm", "run", "dev", "--", "--host"]