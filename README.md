# Faztore

Store management system with clean code, minimalism, and performance.

## Tech Stack

- SvelteKit + TypeScript + DaisyUI + TailwindCSS
- PostgreSQL 16 with Kysely
- Docker & Docker Compose
- JWT authentication
- TypeScript migrations

## Quick Start

Prerequisites: Docker & Docker Compose

```bash
./docker.sh build && ./docker.sh up && ./docker.sh setup
# → http://localhost:5173
```

## Commands

```bash
# Core
./docker.sh build                    # Build
./docker.sh up                       # Start
./docker.sh down                     # Stop
./docker.sh status                   # Status
./docker.sh logs                     # Logs
./docker.sh test                     # Tests

# Database
./docker.sh setup                    # Initialize
./docker.sh setup:reset              # Reset
./docker.sh db:migrate               # Migrate
./docker.sh db:rollback              # Rollback
./docker.sh db:status                # Status
./docker.sh db:create "name"         # Create migration
./docker.sh db:generate              # Generate types
./docker.sh db:shell                 # PostgreSQL shell
```

## Database Structure

```
database/
├── init/           # Initial schema
├── migrations/     # Future changes
└── dev/           # Migration tools
```

## Environment

Docker configures:
- `DB_HOST=postgres`, `DB_USER=postgres`, `DB_PASSWORD=postgres`, `DB_NAME=faztore`
- `JWT_SECRET`, `NODE_ENV=development`
- External: `localhost:5432`

## Workflows

### Setup
```bash
./docker.sh build && ./docker.sh up && ./docker.sh setup
```

### Development
```bash
./docker.sh up
./docker.sh test
./docker.sh db:create "feature name"
./docker.sh db:migrate
./docker.sh db:generate
```

### Troubleshooting
```bash
./docker.sh status
./docker.sh logs
./docker.sh setup:reset
```