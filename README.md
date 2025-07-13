# 🚀 Faztore Admin

Modern, minimalist Svelte + PostgreSQL + Docker boilerplate.

## Features

- **Svelte 5** - Latest version with modern architecture
- **PostgreSQL 16** - Rock-solid database with Alpine Linux
- **Docker** - Clean, expert-level containerization
- **Kysely** - Type-safe SQL query builder
- **TypeScript** - Full type safety
- **Minimalist** - No bloat, only essentials

## Quick Start

```bash
# Start development environment
./docker.sh up

# Install dependencies
./docker.sh npm install

# Run tests (format + lint + check)
./docker.sh test

# View logs
./docker.sh logs

# Stop environment
./docker.sh down
```

## Docker Commands

```bash
./docker.sh build      # Build containers
./docker.sh up         # Start development
./docker.sh down       # Stop environment
./docker.sh restart    # Restart services
./docker.sh clean      # Clean containers
./docker.sh clean-all  # Nuclear cleanup
./docker.sh npm [cmd]  # Run npm commands
./docker.sh db:migration [name] # Create migration
./docker.sh db:migrate         # Run migrations
./docker.sh db:rollback        # Rollback migration
./docker.sh db:reset           # Reset database
./docker.sh db:generate        # Generate types
./docker.sh shell      # Open app shell
./docker.sh db-shell   # Open PostgreSQL shell
./docker.sh status     # Show status
```

## Architecture

- **App**: http://localhost:5173
- **Database**: localhost:5432
- **Node modules**: Visible in VS Code via named volume
- **Hot reload**: Enabled for development

## Database Architecture

**Minimalist, clean code approach** - Clean separation of concerns:

```
database/
├── core/                 # SvelteKit application database access
│   ├── connection.ts     # Database connection with $env pattern
│   └── index.ts          # Clean exports for app
└── dev/                  # Development tools and migrations
    ├── connection.ts     # Dev connection with process.env
    ├── migrator.ts       # Migration management
    ├── generate-types.ts # Type generation script
    ├── init/
    │   └── 01-init.sql   # Docker initialization (extensions only)
    └── migrations/       # Migration files
        └── 2024-07-13T00-00-00-000-create-users-table.ts

src/lib/
├── database/
│   └── index.ts          # Re-exports from database/core
└── types/
    ├── core/
    │   └── database.ts   # Auto-generated types (DO NOT EDIT)
    └── index.ts          # Organized type exports
```

### Database Commands

```bash
# Create new migration
./docker.sh npm run db:migration <name>

# Run pending migrations
./docker.sh npm run db:migrate

# Rollback last migration
./docker.sh npm run db:rollback

# Reset database (drop all + rerun migrations)
./docker.sh npm run db:reset

# Generate TypeScript types from schema
./docker.sh npm run db:generate

# Open PostgreSQL shell
./docker.sh npm run db:shell
```

### Workflow

1. **Create Migration**: `npm run db:migration create-users-table`
2. **Edit Migration**: Add your schema changes in `database/dev/migrations/`
3. **Run Migration**: `npm run db:migrate`
4. **Generate Types**: `npm run db:generate` (auto-generates TypeScript types)
5. **Use Types**: Import from `src/lib/types` or `src/lib/database`

### Migration Files

Located in `database/dev/migrations/` with format: `YYYY-MM-DDTHH-mm-ss-name.ts`

```typescript
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('example')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('example').execute();
}
```

### Type Usage

```typescript
// Clean imports
import { db, type User, type NewUser } from '$lib/database';

// Type-safe queries
const users: User[] = await db.selectFrom('users').selectAll().execute();
const newUser: NewUser = { email: 'test@example.com', username: 'test' };
```

Built with ❤️ for modern development.
