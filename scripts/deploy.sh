#!/bin/bash

# KingdomQuest Production Deployment Script
# This script handles deployment to various production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
APP_NAME="kingdom-quest"
PROJECT_DIR="$(pwd)"
BUILD_DIR=".next"
LOG_DIR="logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the project root?"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to validate environment variables
validate_env() {
    print_status "Validating environment variables..."
    
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
    
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    print_success "Environment validation completed"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run unit tests
    print_status "Running unit tests..."
    npm run test:unit 2>&1 | tee "$LOG_DIR/unit-tests.log"
    
    # Run critical tests
    print_status "Running critical tests..."
    npm run test:critical 2>&1 | tee "$LOG_DIR/critical-tests.log"
    
    print_success "All tests passed"
}

# Function to build application
build_app() {
    print_status "Building application..."
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        print_status "Cleaning previous build..."
        rm -rf "$BUILD_DIR"
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production=false 2>&1 | tee "$LOG_DIR/npm-install.log"
    
    # Build application
    print_status "Building Next.js application..."
    npm run build 2>&1 | tee "$LOG_DIR/build.log"
    
    # Check if build was successful
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build failed - output directory not found"
        exit 1
    fi
    
    print_success "Application build completed"
}

# Function to deploy to Vercel
deploy_vercel() {
    local environment=$1
    
    print_status "Deploying to Vercel ($environment)..."
    
    # Check if Vercel CLI is available
    if ! command -v vercel &> /dev/null; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy based on environment
    if [ "$environment" = "production" ]; then
        print_status "Deploying to production..."
        vercel deploy --prod --token="$VERCEL_TOKEN" --yes 2>&1 | tee "$LOG_DIR/deploy-production.log"
    else
        print_status "Deploying to staging..."
        vercel deploy --token="$VERCEL_TOKEN" --yes 2>&1 | tee "$LOG_DIR/deploy-staging.log"
    fi
    
    print_success "Vercel deployment completed"
}

# Function to deploy to Fly.io
deploy_fly() {
    print_status "Deploying to Fly.io..."
    
    # Check if Fly CLI is available
    if ! command -v fly &> /dev/null; then
        print_error "Fly CLI is not installed. Please install it first:"
        echo "curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    
    # Check if fly.toml exists
    if [ ! -f "fly.toml" ]; then
        print_error "fly.toml not found. Run 'fly launch' first."
        exit 1
    fi
    
    # Deploy to Fly.io
    fly deploy 2>&1 | tee "$LOG_DIR/deploy-fly.log"
    
    print_success "Fly.io deployment completed"
}

# Function to run health check
health_check() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Running health check on $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/api/health" > /dev/null; then
            print_success "Health check passed"
            return 0
        fi
        
        print_status "Health check attempt $attempt/$max_attempts failed, retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    print_error "Health check failed after $max_attempts attempts"
    return 1
}

# Function to create deployment summary
create_summary() {
    local deployment_type=$1
    local deployment_url=$2
    
    print_status "Creating deployment summary..."
    
    SUMMARY_FILE="$LOG_DIR/deployment-summary-$(date +'%Y%m%d-%H%M%S').json"
    
    cat > "$SUMMARY_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployment_type": "$deployment_type",
  "deployment_url": "$deployment_url",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "node_version": "$(node --version)",
  "npm_version": "$(npm --version)",
  "build_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "status": "success"
}
EOF
    
    print_success "Deployment summary saved to $SUMMARY_FILE"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] DEPLOYMENT_TYPE"
    echo ""
    echo "DEPLOYMENT_TYPE:"
    echo "  vercel-staging    Deploy to Vercel staging environment"
    echo "  vercel-production Deploy to Vercel production environment"
    echo "  fly               Deploy to Fly.io"
    echo ""
    echo "OPTIONS:"
    echo "  --skip-tests      Skip running tests"
    echo "  --skip-build      Skip building application (use existing build)"
    echo "  --skip-health     Skip health check after deployment"
    echo "  --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 vercel-production"
    echo "  $0 vercel-staging --skip-tests"
    echo "  $0 fly --skip-health"
}

# Main deployment function
main() {
    local deployment_type=""
    local skip_tests=false
    local skip_build=false
    local skip_health=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --skip-health)
                skip_health=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            vercel-staging|vercel-production|fly)
                deployment_type=$1
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check if deployment type is specified
    if [ -z "$deployment_type" ]; then
        print_error "Deployment type is required"
        show_usage
        exit 1
    fi
    
    print_status "Starting KingdomQuest deployment..."
    print_status "Deployment type: $deployment_type"
    
    # Start timer
    start_time=$(date +%s)
    
    # Run deployment steps
    check_prerequisites
    validate_env
    
    if [ "$skip_tests" != true ]; then
        run_tests
    else
        print_warning "Skipping tests"
    fi
    
    if [ "$skip_build" != true ]; then
        build_app
    else
        print_warning "Skipping build"
    fi
    
    # Deploy based on type
    case $deployment_type in
        vercel-staging)
            deploy_vercel "staging"
            deployment_url="https://staging-kingdom-quest.vercel.app"
            ;;
        vercel-production)
            deploy_vercel "production"
            deployment_url="https://kingdom-quest.vercel.app"
            ;;
        fly)
            deploy_fly
            deployment_url="https://kingdom-quest.fly.dev"
            ;;
    esac
    
    # Health check
    if [ "$skip_health" != true ]; then
        health_check "$deployment_url"
    else
        print_warning "Skipping health check"
    fi
    
    # Create summary
    create_summary "$deployment_type" "$deployment_url"
    
    # Calculate deployment time
    end_time=$(date +%s)
    duration=$((end_time - start_time))
    
    print_success "Deployment completed successfully!"
    print_status "Total deployment time: ${duration}s"
    print_status "Deployment URL: $deployment_url"
}

# Run main function with all arguments
main "$@"