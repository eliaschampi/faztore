#!/bin/bash

# Faztore Admin Docker Management Script
# Expert-level Docker commands for modern development

set -e

# Colors for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Main commands
case "$1" in
    "build")
        log_info "Building faztore-admin containers..."
        docker-compose build --no-cache
        log_success "Build completed!"
        ;;
    
    "up")
        log_info "Starting faztore-admin development environment..."
        docker-compose up -d
        log_success "Environment is running!"
        log_info "App: http://localhost:5173"
        log_info "DB: localhost:5432"
        ;;
    
    "down")
        log_info "Stopping faztore-admin environment..."
        docker-compose down
        log_success "Environment stopped!"
        ;;
    
    "restart")
        log_info "Restarting faztore-admin environment..."
        docker-compose restart
        log_success "Environment restarted!"
        ;;
    
    "logs")
        if [ -z "$2" ]; then
            docker-compose logs -f
        else
            docker-compose logs -f "$2"
        fi
        ;;
    
    "clean")
        log_warning "Cleaning Docker system..."
        docker-compose down -v
        docker system prune -f
        log_success "Basic cleanup completed!"
        ;;
    
    "clean-all")
        log_warning "Nuclear cleanup - removing ALL Docker data..."
        docker-compose down -v
        docker rmi -f $(docker images -aq) 2>/dev/null || true
        docker system prune -a --volumes -f
        log_success "Nuclear cleanup completed!"
        ;;
    
    "npm")
        shift
        log_info "Running npm $@ in container..."
        docker-compose exec app npm "$@"
        ;;
    
    "db:migration")
        shift
        log_info "Creating database migration: $@"
        docker-compose exec app npm run db:migration "$@"
        ;;

    "db:migrate")
        log_info "Running database migrations..."
        docker-compose exec app npm run db:migrate
        ;;

    "db:rollback")
        log_info "Rolling back last migration..."
        docker-compose exec app npm run db:rollback
        ;;

    "db:reset")
        log_info "Resetting database..."
        docker-compose exec app npm run db:reset
        ;;

    "db:generate")
        log_info "Generating database types..."
        docker-compose exec app npm run db:generate
        ;;
    
    "test")
        log_info "Running tests (format + lint + check)..."
        docker-compose exec app npm run test
        ;;
    
    "shell")
        log_info "Opening shell in app container..."
        docker-compose exec app sh
        ;;
    
    "db:shell")
        log_info "Opening PostgreSQL shell..."
        docker-compose exec db psql -U postgres -d faztore_admin
        ;;
    
    "status")
        log_info "Container status:"
        docker-compose ps
        ;;
    
    *)
        echo -e "${BLUE}🚀 Faztore Admin Docker Manager${NC}"
        echo ""
        echo "Usage: ./docker.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build      Build containers"
        echo "  up         Start development environment"
        echo "  down       Stop environment"
        echo "  restart    Restart environment"
        echo "  logs       Show logs (optional: service name)"
        echo "  clean      Clean containers and volumes"
        echo "  clean-all  Nuclear cleanup (removes everything)"
        echo "  npm        Run npm commands in container"
        echo "  test       Run format + lint + check"
        echo "  shell      Open shell in app container"
        echo "  db:shell   Open PostgreSQL shell"
        echo "  status     Show container status"
        echo ""
        echo "Database Commands:"
        echo "  db:migration   Create new migration"
        echo "  db:migrate     Run pending migrations"
        echo "  db:rollback    Rollback last migration"
        echo "  db:reset       Reset database"
        echo "  db:generate    Generate TypeScript types"
        echo ""
        echo "Examples:"
        echo "  ./docker.sh up"
        echo "  ./docker.sh npm install"
        echo "  ./docker.sh db:migration create-users-table"
        echo "  ./docker.sh db:migrate"
        echo "  ./docker.sh logs app"
        ;;
esac
