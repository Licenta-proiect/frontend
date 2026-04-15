# Use Node 20 (LTS) for stability with React 19/Next 16
# alpine is a very small and fast Linux distribution
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files
# We also copy package-lock.json to maintain exact versions of the libraries
COPY package*.json ./

# Install dependencies
# Standard install for npm to process the package.json
RUN npm install

# Copy the rest of the source code into the container
COPY . .

# Build the application for production (Next.js build)
RUN npm run build

# Expose port 3000 (default Next.js port)
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start"]