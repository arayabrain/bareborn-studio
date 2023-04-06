#!/bin/bash

# Remove old docker containers if exists
docker-compose -f docker-compose.dev.yml  down

# Build and run docker-compose in background
docker-compose -f docker-compose.dev.yml up -d