# GalaxyAPI Dockerfile

# Specify base node.js image
FROM node:boron

# Default to development environment
ARG TARGET=development

RUN echo "Building for target environment: ${TARGET}"

# Create application directory
RUN mkdir -p /usr/src/galaxyAPI

# Set the current working directory
WORKDIR /usr/src/galaxyAPI

# Copy source code
COPY . /usr/src/galaxyAPI/

# Set strict-ssl to false if you see cert issues
RUN npm config set strict-ssl false

# Install application dependencies
RUN npm install

# Make port 31000 available to the world outside this container
#EXPOSE 3000
EXPOSE 31000

#Define command to run the application
CMD [ "npm", "start" ]