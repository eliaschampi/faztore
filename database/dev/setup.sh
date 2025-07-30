#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

is_container() {
    [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null
}

wait_for_db() {
    log "Waiting for database connection..."
    local attempt=1
    while [ $attempt -le 30 ]; do
        if tsx database/dev/migrate.ts check >/dev/null 2>&1; then
            success "Database connection established"
            return 0
        fi
        log "Attempt $attempt/30 - waiting for database..."
        sleep 2
        ((attempt++))
    done
    error "Database connection failed after 30 attempts"
    return 1
}

is_db_initialized() {
    log "Checking if database is initialized..."
    # Check if any tables exist (if tables exist, database is initialized)
    if tsx database/dev/migrate.ts check:tables 2>/dev/null | grep -q "true"; then
        success "Database is already initialized"
        return 0
    else
        log "Database needs initialization"
        return 1
    fi
}

init_database() {
    log "Initializing database with SQL files..."
    if tsx database/dev/migrate.ts init >/dev/null 2>&1; then
        success "Database initialization completed"
    else
        error "Database initialization failed"
        return 1
    fi
}

run_migrations() {
    log "Running database migrations..."
    if tsx database/dev/migrate.ts migrate; then
        success "Migrations completed"
    else
        error "Migrations failed"
        return 1
    fi
}

generate_types() {
    log "Generating TypeScript types..."
    if npm run db:generate >/dev/null 2>&1; then
        success "Types generated successfully"
    else
        error "Type generation failed"
        return 1
    fi
}

setup_database() {
    log "Starting database setup..."

    # Check if running in container
    if ! is_container; then
        error "Must run inside container. Use: ./docker.sh setup"
        exit 1
    fi

    # Wait for database
    if ! wait_for_db; then
        error "Cannot connect to database"
        exit 1
    fi

    # Initialize or migrate
    if is_db_initialized; then
        log "Database already initialized, running migrations only..."
        run_migrations
        generate_types
    else
        log "Fresh database detected, running full initialization..."
        init_database
        run_migrations
        generate_types
    fi

    success "Database setup completed successfully!"
}

show_status() {
    log "Checking database status..."

    if ! wait_for_db >/dev/null 2>&1; then
        error "Database connection failed. Run: ./docker.sh up"
        return 1
    fi

    if is_db_initialized >/dev/null 2>&1; then
        success "Database is initialized"
        log "Running migration status check..."
        if tsx database/dev/migrate.ts status 2>/dev/null; then
            success "Migration status retrieved"
        else
            warn "Migration system not fully initialized"
        fi
    else
        warn "Database not initialized. Run: ./docker.sh setup"
    fi
}

reset_database() {
    log "Resetting database..."
    warn "This will destroy ALL data and reset to initial state!"
    read -p "Are you sure? Type 'yes' to confirm: " -r
    if [[ $REPLY == "yes" ]]; then
        log "Dropping all tables and schema..."
        if tsx database/dev/migrate.ts reset >/dev/null 2>&1; then
            success "Database reset completed"
            log "Reinitializing database with init files..."
            if init_database && run_migrations && generate_types; then
                success "Database fully reinitialized!"
                log "All init files applied, migrations table is empty"
                log "Ready for new migrations"
            else
                error "Failed to reinitialize database after reset"
                return 1
            fi
        else
            error "Database reset failed"
            return 1
        fi
    else
        log "Reset cancelled"
    fi
}

case "${1:-setup}" in
    "setup"|"init") setup_database ;;
    "status") show_status ;;
    "reset") reset_database ;;
    *)
        echo "Usage: bash database/dev/setup.sh [setup|status|reset]"
        echo ""
        echo "Commands:"
        echo "  setup   - Initialize database and run migrations"
        echo "  status  - Show database and migration status"
        echo "  reset   - Reset database (destroys all data)"
        ;;
esac
