#!/bin/bash

# Remove old docker containers if exists
docker-compose down

# Build and run docker-compose in background
docker-compose up -d