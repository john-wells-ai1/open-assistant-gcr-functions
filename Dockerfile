# Use an official Node.js runtime as a base image
FROM node:20-alpine

# Create and set the app directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the port Cloud Run listens on
EXPOSE 8080

# Run the app
CMD [ "npm", "start" ]
