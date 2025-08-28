#!/bin/bash

# KingdomQuest Deployment Helper Script
# This script provides utilities for deployment and environment management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deploy.log"

# Utility functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Validate environment
validate_env() {
    log_info "Validating environment..."
    
    # Check Node.js version
    if ! command_exists node; then
        log_error "Node.js is not installed"
        return 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_NODE_MAJOR=18
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
    
    if [ "$NODE_MAJOR" -lt "$REQUIRED_NODE_MAJOR" ]; then
        log_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_NODE_MAJOR+"
        return 1
    fi
    
    log_success "Node.js version $NODE_VERSION is compatible"
    
    # Check package manager
    if command_exists pnpm; then
        PKG_MANAGER="pnpm"
        log_success "Using pnpm package manager"
    elif command_exists npm; then
        PKG_MANAGER="npm"
        log_warning "Using npm package manager (pnpm recommended)"
    else
        log_error "No package manager found (npm or pnpm required)"
        return 1
    fi
    
    # Validate environment variables
    log_info "Validating environment variables..."
    if command_exists npx && [ -f "$PROJECT_ROOT/scripts/validate-env.ts" ]; then
        if npx tsx "$PROJECT_ROOT/scripts/validate-env.ts"; then
            log_success "Environment variables validated"
        else
            log_error "Environment validation failed"
            return 1
        fi
    else
        log_warning "Environment validation script not available"
    fi
    
    return 0
}

# Pre-deployment checks
pre_deploy_checks() {
    log_info "Running pre-deployment checks..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    $PKG_MANAGER install
    
    # Run linting
    log_info "Running linting checks..."
    if $PKG_MANAGER run lint; then
        log_success "Linting passed"
    else
        log_error "Linting failed"
        return 1
    fi
    
    # Run type checking
    log_info "Running type checking..."
    if $PKG_MANAGER run type-check; then
        log_success "Type checking passed"
    else
        log_error "Type checking failed"
        return 1
    fi
    
    # Run tests
    log_info "Running tests..."
    if $PKG_MANAGER run test:unit; then
        log_success "Unit tests passed"
    else
        log_error "Unit tests failed"
        return 1
    fi
    
    # Build application
    log_info "Building application..."
    if $PKG_MANAGER run build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        return 1
    fi
    
    return 0
}

# Deploy to Vercel
deploy_vercel() {
    local environment="$1"
    local production_flag=""
    
    if [ "$environment" = "production" ]; then
        production_flag="--prod"
    fi
    
    log_info "Deploying to Vercel ($environment)..."
    
    if ! command_exists vercel; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel@latest
    fi
    
    # Deploy with Vercel
    if vercel $production_flag --yes; then
        log_success "Vercel deployment completed"
        return 0
    else
        log_error "Vercel deployment failed"
        return 1
    fi
}

# Health check
health_check() {
    local url="$1"
    local max_attempts=10
    local attempt=0
    
    log_info "Performing health check on $url"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$url/api/health" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_info "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Show help
show_help() {
    echo "KingdomQuest Deployment Helper"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  validate      Validate environment and dependencies"
    echo "  check         Run pre-deployment checks (lint, test, build)"
    echo "  deploy        Deploy to Vercel (preview by default)"
    echo "  deploy-prod   Deploy to production"
    echo "  health        Perform health check on deployed app"
    echo "  full          Full deployment pipeline (check + deploy + health)"
    echo "  help          Show this help message"
    echo ""
    echo "Options:"
    echo "  --url URL     Specify URL for health checks"
    echo "  --skip-tests  Skip running tests during checks"
    echo "  --verbose     Enable verbose logging"
    echo ""
    echo "Examples:"
    echo "  $0 validate"
    echo "  $0 check --skip-tests"
    echo "  $0 deploy-prod"
    echo "  $0 health --url https://kingdom-quest.vercel.app"
    echo "  $0 full --url https://kingdom-quest.vercel.app"
}

# Main script logic
main() {
    local command="${1:-help}"
    local url=""
    local skip_tests=false
    local verbose=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --url)
                url="$2"
                shift 2
                ;;
            --skip-tests)
                skip_tests=true
                shift
                ;;
            --verbose)
                verbose=true
                set -x
                shift
                ;;
            -*)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$command" ] || [ "$command" = "help" ]; then
                    command="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Initialize log file
    echo "[$(date)] Starting deployment script: $command" > "$LOG_FILE"
    
    case $command in
        validate)
            validate_env
            ;;
        check)
            validate_env || exit 1
            pre_deploy_checks
            ;;
        deploy)
            validate_env || exit 1
            if [ "$skip_tests" = false ]; then
                pre_deploy_checks || exit 1
            fi
            deploy_vercel "preview"
            ;;
        deploy-prod)
            validate_env || exit 1
            if [ "$skip_tests" = false ]; then
                pre_deploy_checks || exit 1
            fi
            deploy_vercel "production"
            ;;
        health)
            if [ -z "$url" ]; then
                log_error "URL required for health check. Use --url option"
                exit 1
            fi
            health_check "$url"
            ;;
        full)
            if [ -z "$url" ]; then
                log_error "URL required for full deployment. Use --url option"
                exit 1
            fi
            validate_env || exit 1
            if [ "$skip_tests" = false ]; then
                pre_deploy_checks || exit 1
            fi
            deploy_vercel "production" || exit 1
            sleep 30  # Wait for deployment to propagate
            health_check "$url"
            ;;
        help|*)
            show_help
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log_success "Script completed successfully"
    else
        log_error "Script failed with exit code $exit_code"
    fi
    
    echo "[$(date)] Script completed with exit code: $exit_code" >> "$LOG_FILE"
    exit $exit_code
}

# Run main function with all arguments
main "$@"