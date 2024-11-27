# Use Node.js LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy the rest of the app files
COPY . .

# Expose the service port
EXPOSE 3000 

# Command to start the service
CMD ["npm", "start"]
