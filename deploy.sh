#!/bin/bash

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="https://dryzqmvqcwztkzuoysnr.supabase.co"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeXpxbXZxY3d6dGt6dW95c25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDg5ODksImV4cCI6MjA3MTcyNDk4OX0.KRF6N8sEc36WnxOSktNdtv-IXifXle6LCRyG0N5Gmlk"
export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Start the server
echo "Starting the server..."
npm run start
