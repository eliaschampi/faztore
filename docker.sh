#!/bin/bash
set -e

readonly PROJECT_NAME="faztore"
readonly COMPOSE_FILE="docker-compose.yml"

check_docker() {
    command -v docker &> /dev/null || { echo "Docker not installed"; exit 1; }
    command -v docker-compose &> /dev/null || { echo "Docker Compose not installed"; exit 1; }
    docker info &> /dev/null || { echo "Docker daemon not running"; exit 1; }
}

check_compose_file() {
    [[ -f "$COMPOSE_FILE" ]] || { echo "Docker Compose file not found"; exit 1; }
}

cmd_build() {
    docker-compose -f "$COMPOSE_FILE" build
}

cmd_up() {
    docker-compose -f "$COMPOSE_FILE" up -d
}

cmd_down() {
    docker-compose -f "$COMPOSE_FILE" down
}

cmd_restart() {
    cmd_down && cmd_up
}

cmd_logs() {
    docker-compose -f "$COMPOSE_FILE" logs -f
}

cmd_shell() {
    docker exec -it "${PROJECT_NAME}_app" /bin/sh
}

cmd_npm() {
    shift
    docker exec -it "${PROJECT_NAME}_app" npm "$@"
}

cmd_sync() {
    docker run --rm -d --name temp_sync -v faztore_node_modules:/app/node_modules alpine:latest sleep 30
    [ -d "./node_modules" ] && rm -rf ./node_modules
    docker cp temp_sync:/app/node_modules ./
    chown -R $(id -u):$(id -g) ./node_modules 2>/dev/null || true
    docker stop temp_sync >/dev/null 2>&1 || true
}

cmd_db_shell() {
    docker exec -it "${PROJECT_NAME}_postgres" psql -U postgres -d "$PROJECT_NAME"
}

cmd_setup() {
    docker-compose ps | grep -q "Up" || { echo "Containers not running. Run: ./docker.sh up"; exit 1; }
    docker exec -it "${PROJECT_NAME}_app" bash database/dev/setup.sh
}

cmd_setup_reset() {
    read -p "Reset database? This destroys all data (y/N): " -n 1 -r; echo
    [[ $REPLY =~ ^[Yy]$ ]] || { echo "Cancelled"; exit 0; }
    docker-compose down -v
    docker-compose up -d
    sleep 5
    docker exec -it "${PROJECT_NAME}_app" npm run setup
}

check_containers() {
    docker-compose ps | grep -q "Up" || { echo "Containers not running. Run: ./docker.sh up"; exit 1; }
}

cmd_db_migrate() {
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run db:migrate
}

cmd_db_rollback() {
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run db:rollback
}

cmd_db_status() {
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run db:status
}

cmd_db_generate() {
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run db:generate
}

cmd_db_create() {
    shift
    [ $# -eq 0 ] && { echo "Migration name required"; exit 1; }
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run db:create "$@"
}

cmd_status() {
    docker-compose -f "$COMPOSE_FILE" ps
}

cmd_test() {
    check_containers
    docker exec -it "${PROJECT_NAME}_app" npm run test
}

show_help() {
    cat << EOF
Faztore Docker Management

Usage: ./docker.sh [command]

Quick Start: ./docker.sh build && ./docker.sh up && ./docker.sh setup

Commands:
  build           Build images
  up              Start services
  down            Stop services
  restart         Restart services
  logs            View logs
  status          Show status
  shell           App shell
  npm             Run npm commands
  sync            Sync node_modules for VS Code
  test            Run tests

Database:
  setup           Initialize database
  setup:reset     Reset database
  db:shell        PostgreSQL shell
  db:migrate      Run migrations
  db:rollback     Rollback migrations
  db:status       Migration status
  db:generate     Generate types
  db:create       Create migration
EOF
}

main() {
    check_docker
    check_compose_file

    case "${1:-help}" in
        "build")        cmd_build ;;
        "up")           cmd_up ;;
        "down")         cmd_down ;;
        "restart")      cmd_restart ;;
        "logs")         cmd_logs ;;
        "status")       cmd_status ;;
        "shell")        cmd_shell ;;
        "npm")          cmd_npm "$@" ;;
        "sync")         cmd_sync ;;
        "test")         cmd_test ;;
        "setup")        cmd_setup ;;
        "setup:reset")  cmd_setup_reset ;;
        "db:shell")     cmd_db_shell ;;
        "db:migrate")   cmd_db_migrate ;;
        "db:rollback")  cmd_db_rollback ;;
        "db:status")    cmd_db_status ;;
        "db:generate")  cmd_db_generate ;;
        "db:create")    cmd_db_create "$@" ;;
        "help"|"-h"|"--help") show_help ;;
        *)              echo "Unknown command: $1"; show_help; exit 1 ;;
    esac
}

main "$@"