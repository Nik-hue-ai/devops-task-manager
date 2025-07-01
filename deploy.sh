#!/bin/bash

# AutoDeploy Hub Deployment Script
# This script helps deploy the application in different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build and start all services
    docker-compose up -d --build
    
    print_status "Waiting for services to be healthy..."
    
    # Wait for services to be ready
    sleep 30
    
    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running!"
        print_status "Application URLs:"
        echo "  🌐 Frontend: http://localhost:3000"
        echo "  🔧 Backend API: http://localhost:5000"
        echo "  📊 Grafana: http://localhost:3001 (admin/admin)"
        echo "  📈 Prometheus: http://localhost:9090"
        echo "  🗄️  PostgreSQL: localhost:5432"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
        exit 1
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    print_success "Services stopped!"
}

# Function to clean up everything
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    print_success "Cleanup completed!"
}

# Function to show logs
show_logs() {
    if [ -n "$2" ]; then
        docker-compose logs -f "$2"
    else
        docker-compose logs -f
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Backend tests
    print_status "Running backend tests..."
    cd backend
    python -m pytest -v
    cd ..
    
    # Frontend tests (if npm is available)
    if command_exists npm; then
        print_status "Running frontend tests..."
        cd frontend
        npm test -- --coverage --watchAll=false
        cd ..
    else
        print_warning "npm not found, skipping frontend tests"
    fi
    
    print_success "All tests passed!"
}

# Function to deploy to Kubernetes
deploy_k8s() {
    print_status "Deploying to Kubernetes..."
    
    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Please install kubectl first."
        exit 1
    fi
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/
    
    print_status "Waiting for deployment to complete..."
    kubectl wait --for=condition=available --timeout=300s deployment/backend -n autodeploy-hub
    kubectl wait --for=condition=available --timeout=300s deployment/frontend -n autodeploy-hub
    
    print_success "Kubernetes deployment completed!"
    
    # Show service information
    kubectl get services -n autodeploy-hub
}

# Function to show help
show_help() {
    echo "AutoDeploy Hub Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Build and start all services with Docker Compose"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs for all services (or specify service name)"
    echo "  test      Run all tests"
    echo "  k8s       Deploy to Kubernetes"
    echo "  cleanup   Stop services and clean up Docker resources"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                 # Start all services"
    echo "  $0 logs backend          # Show backend logs"
    echo "  $0 test                  # Run tests"
    echo "  $0 k8s                   # Deploy to Kubernetes"
}

# Main script logic
case "${1:-help}" in
    start)
        check_prerequisites
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 5
        start_services
        ;;
    logs)
        show_logs "$@"
        ;;
    test)
        run_tests
        ;;
    k8s)
        deploy_k8s
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
