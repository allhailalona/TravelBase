FROM node:20

WORKDIR /app

# Update and install needed tools
RUN apt-get update && apt-get install -y netcat-traditional dos2unix

# Copy package files first to leverage caching
COPY package*.json package-lock.json ./
RUN npm ci --include=dev

# Copy all backend files, including the wait-and-init.sh script
COPY . .

# Convert line endings and make script executable
RUN dos2unix setup/wait-and-init.sh && chmod +x setup/wait-and-init.sh

ENV CHOKIDAR_USEPOLLING=true

CMD ["/bin/sh", "-c", "./setup/wait-and-init.sh & npm run server"]
