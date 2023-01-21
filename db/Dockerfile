# ==== CONFIGURE =====
# Use a Node 16 base image
FROM node:16-alpine 
# Set the working directory to /app inside the container
WORKDIR /app
# Cache and Install dependencies
COPY package.json .
RUN yarn install
# Copy app files
COPY . .
# Expose port
EXPOSE 5003
# Start the app
CMD [ "node", "index" ]