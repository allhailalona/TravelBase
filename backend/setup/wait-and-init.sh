#!/bin/bash

echo "Waiting for database..."
while ! nc -z db 3306; do   
 echo "Trying to verify connection again..."
 sleep 1
done

# Wait for init.sql
sleep 10

echo "Running vacation and followers initialization..."
npx tsx setup/initVacationsAndFollowers.ts