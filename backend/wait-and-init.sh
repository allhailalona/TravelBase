#!/bin/bash

# Wait for database to be ready using node
echo "Waiting for database..."
while ! nc -z db 3306; do   
  sleep 1
done

# Wait additional time for init.sql to complete
sleep 10

# Run the initialization script
echo "Running vacation and followers initialization..."
npx tsx initVacationsAndFollowers.ts