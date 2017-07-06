# Galaxy API

REST services and middleware layer for CoMIT, MARS, and other new transformation project 
applications. 

## Setup

### Prerequisites

Install [Node.js and npm](https://nodejs.org/en/).

### Installation

The Node Package Manager will install any dependencies for Galaxy API as they are 
introduced. Simply run the following command after ensuring Node.js and npm are 
installed on your machine.

```
npm install
```

### Credentials

Ensure that proper, valid credentials are set in [config](config/config) 
before starting Galaxy API. These are required for Galaxy API to function correctly.

### Dependencies

This project is tightly bound to Galaxy Java API and runs in the same Kubernetes pod.
This relationship is specified in the k8 yaml files and these two projects should always
be deployed together.

## Usage

Run the following command to start Galaxy API on http://localhost:31000. The port 
can be configured in [app.js](app.js).

```
npm start
```

## Tests

Run the following command to run all unit tests for Galaxy API

```
npm test
```

### Docker Build

This project contains Docker build assets that will allow it to be built as
a Docker container. You can also pass a build argument that allows you to specify
a target environment of development (default), test, or production:
    
    docker build -t galaxyapi:[version] --build-arg TARGET=test .

### Kubernetes Deployment

This project contains yaml files that will allow it to be deployed to a kubernetes cluster as a
multi-container pod that contains both galaxyAPI and galaxyJavaAPI:

    k8-deployment.yaml - create deployment for galaxy multi-container pod
    k8-service.yaml - create a service for galaxyAPI running on nodeport 31000

    kubectl create -f k8-deployment.yaml
    kubectl create -f k8-service.yaml