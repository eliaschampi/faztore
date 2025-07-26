#!/bin/bash
set -e

is_container() {
    [ -f /.dockerenv ] || grep -q docker /proc/1/cgroup 2>/dev/null
}

wait_for_db() {
    local attempt=1
    while [ $attempt -le 30 ]; do
        if npx tsx database/dev/migrate.ts check >/dev/null 2>&1; then
            return 0
        fi
        sleep 2
        ((attempt++))
    done
    return 1
}

is_db_initialized() {
    npx tsx database/dev/migrate.ts check:tables >/dev/null 2>&1
}

setup_database() {
    is_container || { echo "Must run inside container. Use: ./docker.sh setup"; exit 1; }
    wait_for_db || { echo "Cannot connect to database"; exit 1; }

    if is_db_initialized; then
        npm run db:migrate
        npm run db:generate
    else
        npm run db:init
        npm run db:migrate
        npm run db:generate
    fi
}

show_status() {
    if wait_for_db >/dev/null 2>&1; then
        if is_db_initialized; then
            npm run db:status 2>/dev/null || echo "Migration system not initialized"
        else
            echo "Database not initialized. Run: ./docker.sh setup"
        fi
    else
        echo "Database connection failed. Run: ./docker.sh up"
    fi
}

case "${1:-setup}" in
    "setup"|"init") setup_database ;;
    "status") show_status ;;
    *)
        echo "Usage: bash database/dev/setup.sh [setup|status]"
        ;;
esac
