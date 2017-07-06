#!/bin/bash
docker build -t galaxyapi:0.4 .
# Can build with a target environment:
#docker build -t galaxyapi:0.x --build-arg TARGET=test .
docker tag galaxyapi:0.4 192.168.99.100:5000/galaxyapi:0.4
docker push 192.168.99.100:5000/galaxyapi:0.4