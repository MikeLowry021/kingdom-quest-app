#!/bin/bash

# KingdomQuest Development Script
# This script sets up and runs the development environment

set -e

echo "🔥 Starting KingdomQuest Development Environment"
echo "==============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "📋 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the kingdom-quest directory."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "📦 Dependencies already installed, skipping..."
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Please create it with your Supabase credentials."
    echo "   You can copy from .env.local.example if it exists."
    echo "   Required variables:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
    echo "   - NEXT_PUBLIC_SITE_URL"
else
    echo "✅ Environment configuration found"
fi

# Function to start the development server
start_dev_server() {
    echo "🚀 Starting Next.js development server..."
    echo "   The application will be available at: http://localhost:3000"
    echo "   Press Ctrl+C to stop the server"
    echo ""
    npm run dev
}

# Function to build the application
build_app() {
    echo "🔨 Building application for production..."
    npm run build
    echo "✅ Build completed successfully"
}

# Function to start production server
start_prod_server() {
    echo "🚀 Starting production server..."
    npm run start
}

# Function to run linting
run_lint() {
    echo "🔍 Running ESLint..."
    npm run lint
}

# Function to run type checking
run_typecheck() {
    echo "📝 Running TypeScript type checking..."
    npx tsc --noEmit
}

# Function to show help
show_help() {
    echo "KingdomQuest Development Script"
    echo "==============================="
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  dev (default)  - Start development server"
    echo "  build         - Build for production"
    echo "  start         - Start production server"
    echo "  lint          - Run ESLint"
    echo "  typecheck     - Run TypeScript type checking"
    echo "  help          - Show this help message"
    echo ""
    echo "Environment:"
    echo "  - Node.js version: $(node --version)"
    echo "  - npm version: $(npm --version)"
    echo ""
}

# Parse command line arguments
case "${1:-dev}" in
    "dev")
        start_dev_server
        ;;
    "build")
        build_app
        ;;
    "start")
        start_prod_server
        ;;
    "lint")
        run_lint
        ;;
    "typecheck")
        run_typecheck
        ;;
    "help")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac